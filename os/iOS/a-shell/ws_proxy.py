import asyncio
import hashlib
import struct
import socket as _socket
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

LOCAL_HOST = '127.0.0.1'
LOCAL_PORT = 1042  # Сюда будет стучаться Telegram на айфоне

# Константы оригинального протокола Telegram Obfuscation
HANDSHAKE_LEN = 64
SKIP_LEN = 8
PREKEY_LEN = 32
IV_LEN = 16
PROTO_TAG_POS = 56
DC_IDX_POS = 60

# Функция маппинга доменов Web-Telegram из твоего прошлого сообщения
def get_tg_ws_domain(dc: int) -> str:
    if dc == 203:
        dc = 2
    return f'kws{dc}.web.telegram.org'

def try_handshake(handshake: bytes, secret: bytes):
    if len(handshake) < HANDSHAKE_LEN:
        return None
    dec_prekey_and_iv = handshake[SKIP_LEN:SKIP_LEN + PREKEY_LEN + IV_LEN]
    dec_prekey = dec_prekey_and_iv[:PREKEY_LEN]
    dec_iv = dec_prekey_and_iv[PREKEY_LEN:]

    dec_key = hashlib.sha256(dec_prekey + secret).digest()
    dec_iv_int = int.from_bytes(dec_iv, 'big')
    
    decryptor = Cipher(
        algorithms.AES(dec_key), modes.CTR(dec_iv_int.to_bytes(16, 'big'))
    ).encryptor()
    decrypted = decryptor.update(handshake)

    dc_idx = int.from_bytes(decrypted[DC_IDX_POS:DC_IDX_POS + 2], 'little', signed=True)
    return abs(dc_idx), dec_prekey_and_iv

async def handle_client(reader, writer):
    try:
        # Читаем приветственный обфусцированный хэндшейк от Telegram клиента
        handshake = await reader.readexactly(HANDSHAKE_LEN)
        
        # Тестовый фейковый секрет МТПрото (32 нуля) или твой реальный секрет
        secret = b'\x00' * 32 
        
        res = try_handshake(handshake, secret)
        if not res:
            writer.close()
            return
        
        dc_id, crypto_stuff = res
        target_domain = get_tg_ws_domain(dc_id)
        
        print(f"Telegram ломится в DC {dc_id}. Перенаправляем на {target_domain}")
        
        # Подключаемся напрямую к вебсокетам Телеграма через нативный SSL
        import ssl
        ssl_context = ssl.create_default_context()
        
        # Для простоты туннелирования используем сырое TCP-подключение на 443 порт вебсокета
        remote_reader, remote_writer = await asyncio.open_connection(target_domain, 443, ssl=ssl_context)
        
        # Отправляем HTTP Upgrade запрос, притворяясь браузером, открывшим web.telegram.org
        http_req = (
            f"GET /apiws HTTP/1.1\r\n"
            f"Host: {target_domain}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n"
            f"Sec-WebSocket-Protocol: binary\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        ).encode('utf-8')
        
        remote_writer.write(http_req)
        await remote_writer.drain()
        
        # Пропускаем HTTP-ответ сервера (Upgrade OK)
        resp = await remote_reader.readuntil(b'\r\n\r\n')
        
        # Пересылаем первый хэндшейк
        remote_writer.write(handshake)
        await remote_writer.drain()

        # Двусторонний мост данных
        async def forward(src, dst):
            try:
                while True:
                    data = await src.read(4096)
                    if not data: break
                    dst.write(data)
                    await dst.drain()
            except Exception: pass

        await asyncio.gather(forward(reader, remote_writer), forward(remote_reader, writer))
    except Exception as e:
        print(f"Ошибка моста: {e}")
    finally:
        writer.close()

async def main():
    server = await asyncio.start_server(handle_client, LOCAL_HOST, LOCAL_PORT)
    print(f"Прокси-мост запущен на {LOCAL_HOST}:{LOCAL_PORT}")
    print("00000000000000000000000000000000")
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
