import os
import sys
import asyncio
import logging
import binascii

# Пути импорта пакета proxy
_repo_root = os.path.dirname(os.path.abspath(__file__))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    stream=sys.stdout
)

from proxy.config import proxy_config
proxy_config.bind_host = "127.0.0.1"
proxy_config.bind_port = 1042
proxy_config.buffer_size = 32768
proxy_config.proxy_protocol = False

# Твой реальный секрет
proxy_config.secret = "dded87bc65c3bc43ce68b239d14b577a74"

# Отрезаем префикс 'dd' для криптографического ядра (остается 32 символа)
CLEAN_SECRET_HEX = proxy_config.secret[2:]
SECRET_BYTES = binascii.unhexlify(CLEAN_SECRET_HEX)

# Настройка жестких редиректов на рабочие IP серверов Telegram
proxy_config.dc_redirects = {
    1: '149.154.167.220',
    2: '149.154.167.220',
    3: '149.154.167.220',
    4: '149.154.167.220',
    5: '149.154.167.220'
}

async def start_proxy():
    from proxy.tg_ws_proxy import _handle_client
    
    server = await asyncio.start_server(
        lambda r, w: _handle_client(r, w, SECRET_BYTES),
        proxy_config.bind_host,
        proxy_config.bind_port
    )
    
    print(f"\n=============================================")
    print(f" ТОЧНЫЙ КОНФИГ ПОД ТВОЙ СЕКРЕТ ЗАПУЩЕН")
    print(f" Порт: {proxy_config.bind_port}")
    print(f" Секрет: {proxy_config.secret}")
    print(f"=============================================\n")
    
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    try:
        asyncio.run(start_proxy())
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
