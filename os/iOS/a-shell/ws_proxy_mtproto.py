import os
import sys
import asyncio
import logging
import binascii

# Добавляем пути импорта пакета proxy
_repo_root = os.path.dirname(os.path.abspath(__file__))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

# Настройка вывода всех логов работы туннеля в консоль a-Shell
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    stream=sys.stdout
)

# Импортируем конфиг и заполняем переменные, которые требует твоя функция
from proxy.config import proxy_config
proxy_config.bind_host = "127.0.0.1"
proxy_config.bind_port = 1042
proxy_config.buffer_size = 32768
proxy_config.proxy_protocol = False

# Задаем фейковый TLS-домен маскировки (он улетает в _read_client_init)
proxy_config.fake_tls_domain = "itldc.com"

# Конвертируем хекс-строку секрете в байты, так как функция требует тип bytes
SECRET_HEX = "ee00000000000000000000000000000000"
SECRET_BYTES = binascii.unhexlify(SECRET_HEX)

# Заполняем редиректы дата-центров (чтобы не уходить в fallback-ошибку из кода)
proxy_config.dc_redirects = {
    1: '149.154.167.220',
    2: '149.154.167.220',
    3: '149.154.167.220',
    4: '149.154.167.220',
    5: '149.154.167.220'
}

async def start_proxy():
    from proxy.tg_ws_proxy import _handle_client
    
    # Передаем ровно 3 аргумента (reader, writer, secret: bytes)
    server = await asyncio.start_server(
        lambda r, w: _handle_client(r, w, SECRET_BYTES),
        proxy_config.bind_host,
        proxy_config.bind_port
    )
    
    print(f"\n=============================================")
    print(f" ОРИГИНАЛЬНЫЙ ТУННЕЛЬ УСПЕШНО ЗАПУЩЕН НА iOS")
    print(f" Порт: {proxy_config.bind_port}")
    print(f" Секрет: {SECRET_HEX}")
    print(f"=============================================\n")
    
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    try:
        asyncio.run(start_proxy())
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
