import asyncio
import logging
import sys

# Настройка логирования, чтобы видеть все этапы подключения
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    stream=sys.stdout
)

# Жестко прописываем настройки в оригинальный конфиг проекта, минуя GUI
from proxy.config import proxy_config
proxy_config.bind_host = "127.0.0.1"
proxy_config.bind_port = 1042
proxy_config.secret = "ee00000000000000000000000000000000" # Твой фейк-TLS секрет
proxy_config.masking_domain = "itldc.com" # Стандартный домен маскировки
proxy_config.buffer_size = 32768
proxy_config.proxy_protocol = False

# Загружаем пул вебсокетов оригинального проекта
from proxy.pool import ws_pool

async def start_proxy():
    # Импортируем оригинальный обработчик соединений из проекта
    from proxy.tg_ws_proxy import _handle_client
    
    # Запускаем локальный сервер на порту 1042
    server = await asyncio.start_server(
        lambda r, w: _handle_client(r, w, proxy_config.secret, "127.0.0.1", proxy_config.masking_domain),
        proxy_config.bind_host,
        proxy_config.bind_port
    )
    
    print(f"\n=============================================")
    print(f" ОРИГИНАЛЬНЫЙ ТУННЕЛЬ УСПЕШНО ЗАПУЩЕН НА iOS")
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
