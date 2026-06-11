import asyncio
import socket

LOCAL_HOST = '127.0.0.1'
LOCAL_PORT = 1042

# Тот самый рабочий IP-адрес Telegram DC 2 из твоего hosts
REAL_TG_IP = '149.154.167.220'

async def handle_client(reader, writer):
    try:
        # 1. Читаем SOCKS5 Handshake от Telegram
        header = await reader.read(2)
        if not header or header[0] != 0x05:
            return
        
        nmethods = header[1]
        await reader.read(nmethods)
        
        # Отвечаем: SOCKS5, авторизация не требуется
        writer.write(bytes([0x05, 0x00]))
        await writer.drain()

        # 2. Читаем Connect Request
        request = await reader.read(4)
        if not request or request[1] != 0x01:  # Команда CONNECT
            return

        atyp = request[3]
        if atyp == 0x01:    # IPv4
            await reader.read(4)
        elif atyp == 0x03:  # Домен
            domain_len = (await reader.read(1))[0]
            await reader.read(domain_len)
        else:
            return

        # Читаем порт назначения (обычно 443 или 80)
        dest_port = int.from_bytes(await reader.read(2), 'big')

        print(f"Перехвачен коннект. Принудительно заворачиваем трафик на {REAL_TG_IP}:{dest_port}")

        # ПОЛНЫЙ ОБХОД: Плевать, куда ломится Telegram, мы жестко шлем его на рабочий IP ПК
        try:
            remote_reader, remote_writer = await asyncio.open_connection(REAL_TG_IP, dest_port)
        except Exception as e:
            writer.write(bytes([0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
            await writer.drain()
            return

        # Отвечаем успехом подключения
        writer.write(bytes([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
        await writer.drain()

        # 3. Прямой туннель данных в обе стороны
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

    except Exception:
        pass
    finally:
        writer.close()

async def main():
    server = await asyncio.start_server(handle_client, LOCAL_HOST, LOCAL_PORT)
    print(f"Локальный SOCKS5-мост поднят на порту: {LOCAL_PORT}")
    print(f"Все запросы жестко перенаправляются на IP: {REAL_TG_IP}")
    print("------------------------------------------------")
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
