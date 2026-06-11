import asyncio
import hashlib
import struct
import binascii
import ssl

LOCAL_HOST = '127.0.0.1'
LOCAL_PORT = 1042  # Изменено на 1042 по твоей просьбе

HANDSHAKE_LEN = 64
SKIP_LEN = 8
PREKEY_LEN = 32
IV_LEN = 16
PROTO_TAG_POS = 56
DC_IDX_POS = 60

# Реальный фейк-TLS секрет
SECRET_HEX = "ee00000000000000000000000000000000"
SECRET_BYTES = binascii.unhexlify(SECRET_HEX)

def get_tg_ws_domain(dc: int) -> str:
    if dc < 1 or dc > 5:
        dc = 2  # Дефолт на Европу/СНГ, если расшифровался бред
    return f'kws{dc}.web.telegram.org'

def try_handshake(handshake: bytes, secret: bytes):
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    
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
    return abs(dc_idx)

async def handle_client(reader, writer):
    try:
        try:
            handshake = await asyncio.wait_for(reader.readexactly(HANDSHAKE_LEN), timeout=5)
        except Exception:
            writer.close()
            return
        
        dc_id = try_handshake(handshake, SECRET_BYTES)
        target_domain = get_tg_ws_domain(dc_id)
        
        print(f"Подключение: DC {dc_id} -> {target_domain}")
        
        ssl_context = ssl.create_default_context()
        remote_reader, remote_writer = await asyncio.open_connection(target_domain, 443, ssl=ssl_context)
        
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
        
        await remote_reader.readuntil(b'\r\n\r\n')
        
        remote_writer.write(handshake)
        await remote_writer.drain()

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
        print(f"Ошибка: {e}")
    finally:
        writer.close()

async def main():
    server = await asyncio.start_server(handle_client, LOCAL_HOST, LOCAL_PORT)
    print(f"Мост запущен на порту: {LOCAL_PORT}")
    print(f"Используемый SECRET (Hex): {SECRET_HEX}")
    print(f"Используемый SECRET (Bytes): {SECRET_BYTES}")
    print("------------------------------------------------")
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
