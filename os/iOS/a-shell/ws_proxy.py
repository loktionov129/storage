import asyncio
import socket

LOCAL_HOST = '127.0.0.1'
LOCAL_PORT = 1080

async def handle_client(reader, writer):
    try:
        # 1. Принимаем приветствие от Telegram (SOCKS5 Handshake)
        header = await reader.read(2)
        if not header or header[0] != 0x05:
            return
        
        nmethods = header[1]
        methods = await reader.read(nmethods)
        
        # Отвечаем: SOCKS5, аутентификация не требуется (0x00)
        writer.write(bytes([0x05, 0x00]))
        await writer.drain()

        # 2. Получаем запрос на подключение (Connect Request)
        request = await reader.read(4)
        if not request or request[1] != 0x01:  # 0x01 = команда CONNECT
            return

        atyp = request[3]
        if atyp == 0x01:    # IPv4
            dest_address = socket.inet_ntoa(await reader.read(4))
        elif atyp == 0x03:  # Доменное имя
            domain_len = (await reader.read(1))[0]
            dest_address = (await reader.read(domain_len)).decode('utf-8')
        else:
            return

        dest_port = int.from_bytes(await reader.read(2), 'big')

        # Здесь магия: если Telegram ломится на свои сервера, 
        # мы можем подменить адрес на kws2.web.telegram.org или оставить как есть
        # Для простого SOCKS5 просто подключаемся к запрашиваемому адресу
        try:
            remote_reader, remote_writer = await asyncio.open_connection(dest_address, dest_port)
        except Exception:
            # Отдаем ошибку подключения (0x01 - general SOCKS server failure)
            writer.write(bytes([0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
            await writer.drain()
            return

        # Отвечаем успехом (0x00 - succeeded)
        writer.write(bytes([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
        await writer.drain()

        # 3. Запускаем двусторонний обмен данными (Туннель)
        async def forward(src, dst):
            try:
                while True:
                    data = await src.read(4096)
                    if not data:
                        break
                    dst.write(data)
                    await dst.drain()
            except Exception:
                pass

        await asyncio.gather(
            forward(reader, remote_writer),
            forward(remote_reader, writer)
        )

    except Exception:
        pass
    finally:
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass

async def main():
    server = await asyncio.start_server(handle_client, LOCAL_HOST, LOCAL_PORT)
    print(f"SOCKS5 сервер успешно запущен на {LOCAL_HOST}:{LOCAL_PORT}")
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
