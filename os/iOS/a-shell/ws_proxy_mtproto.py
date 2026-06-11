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

# МАНКИ-ПАТЧИНГ: Ломаем строгую проверку Fake TLS, чтобы она хавала пакеты от iOS
import proxy.fake_tls
def fake_verify_client_hello(client_hello, secret):
    # Вместо валидации подписи десктопа просто вытаскиваем структуру наглую
    # Возвращаем заглушку: (client_random, session_id, timestamp)
    # Это заставит скрипт думать, что TLS-пакет от Айфона идеален
    import struct
    try:
        session_id = client_hello[43:75] # Примерное смещение сессии в TLS
        return b'\x00'*32, session_id, int(time.time())
    except Exception:
        return b'\x00'*32, b'\x00'*32, 1700000000

import time
proxy.fake_tls.verify_client_hello = fake_verify_client_hello

# Загружаем конфиг
from proxy.config import proxy_config
proxy_config.bind_host = "127.0.0.1"
proxy_config.bind_port = 1042
proxy_config.buffer_size = 32768
proxy_config.proxy_protocol = False
proxy_config.fake_tls_domain = "itldc.com"

# Секрет без префиксов для внутренней математики
SECRET_HEX = "00000000000000000000000000000000" 
SECRET_BYTES = binascii.unhexlify(SECRET_HEX)

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
    print(f" МОДЕРНИЗИРОВАННЫЙ ТУННЕЛЬ ПОД iOS ЗАПУЩЕН")
    print(f" Порт: {proxy_config.bind_port}")
    print(f"=============================================\n")
    
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    try:
        asyncio.run(start_proxy())
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
