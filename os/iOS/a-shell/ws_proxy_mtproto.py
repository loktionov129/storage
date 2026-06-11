import asyncio
import hashlib
import struct
import binascii
import ssl

LOCAL_HOST = '127.0.0.1'
LOCAL_PORT = 1042

# Жестко фиксируем рабочий сервер Telegram (DC 2)
REAL_TG_IP = '149.154.167.220'
TARGET_DOMAIN = 'kws2.web.telegram.org'

# Тот самый фейк-TLS секрет, который мы введем в Telegram
SECRET_HEX = "ee00000000000000000000000000000000"
SECRET_BYTES = binascii.unhexlify(SECRET_HEX)

async def handle_client(reader, writer):
    try:
        # Читаем стартовый MTProto-хэндшейк (64 байта) от мобильного Telegram
        try:
            handshake = await asyncio.wait_for(reader.readexactly(64), timeout=5)
        except Exception:
            writer.close()
            return

        print(f"Автономный мост: Перехватили MTProto пакет -> Перенаправляем на {TARGET_DOMAIN}")

        # Подключаемся по HTTPS (порт 443) к вебсокетам Телеграма
        ssl_context = ssl.create_default_context()
        remote_reader, remote_writer = await asyncio.open_connection(
            REAL_TG_IP, 443, ssl=ssl_context, server_hostname=TARGET_DOMAIN
        )

        # Отправляем легитимный HTTP Upgrade запрос для WebSocket туннеля
        http_req = (
            f"GET /apiws HTTP/1.1\r\n"
            f"Host: {TARGET_DOMAIN}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n"
            f"Sec-WebSocket-Protocol: binary\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        ).encode('utf-8')
        
        remote_writer.write(http_req)
        await remote_writer.drain()
        
        # Пропускаем успешный ответ от сервера (HTTP 101 Switching Protocols)
        await remote_reader.readuntil(b'\r\n\r\n')

        # Пропихиваем первый стартовый хэндшейк в открывшийся вебсокет-канал
        remote_writer.write(handshake)
        await remote_writer.drain()

        # Запускаем чистый сквозной туннель данных в обе стороны
        async def forward(src, dst):
            try:
                while True:
                    data = await src.read(4096)
                    if not data: break
                    dst.write(data)
                    await dst.drain()
            except Exception: pass

        await asyncio.gather(
            forward(reader, remote_writer),
            forward(remote_reader, writer)
        )

    except Exception as e:
        print(f"Ошибка моста: {e}")
    finally:
        writer.close()

async def main():
    server = await asyncio.start_server(handle_client, LOCAL_HOST, LOCAL_PORT)
    print(f"Автономный MTProto-WS мост запущен на порту: {LOCAL_PORT}")
    print(f"Целевой IP: {REAL_TG_IP} ({TARGET_DOMAIN})")
    print("------------------------------------------------")
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
