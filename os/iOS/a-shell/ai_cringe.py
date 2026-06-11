import asyncio
import socket
import ssl
import sys

TARGET_DOMAIN = 'kws2.web.telegram.org'
REAL_TG_IP = '149.154.167.220'

async def run_diagnostics():
    print("=== ЗАПУСК ДИАГНОСТИКИ СЕТИ ===")
    
    # 1. Тест DNS (Резолвится ли домен на Айфоне)
    print("\n[1/4] Проверка DNS...")
    try:
        ip = socket.gethostbyname(TARGET_DOMAIN)
        print(f"  -> Успех! {TARGET_DOMAIN} резолвится в IP: {ip}")
    except Exception as e:
        print(f"  -> ОШИБКА DNS: {e}")
        print(f"  (Поэтому на ПК нужен hosts. Айфон без hosts пытается идти в Cloudflare)")

    # 2. Трассировка TCP-порта (Доходит ли сырой сигнал до IP из твоего hosts)
    print(f"\n[2/4] Проверка TCP-коннекта до {REAL_TG_IP}:443...")
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(REAL_TG_IP, 443), timeout=4
        )
        print("  -> Успех! Голый порт 443 открыт и отвечает.")
        writer.close()
        await writer.wait_closed()
    except Exception as e:
        print(f"  -> ОШИБКА TCP: Не удалось зацепиться за порт. {e}")
        return

    # 3. Тест SSL/TLS (Принимает ли сервер сертификат Айфона)
    print(f"\n[3/4] Проверка SSL-рукопожатия с имитацией {TARGET_DOMAIN}...")
    try:
        ssl_context = ssl.create_default_context()
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(REAL_TG_IP, 443, ssl=ssl_context, server_hostname=TARGET_DOMAIN),
            timeout=4
        )
        print("  -> Успех! Шифрование SSL/TLS успешно установлено.")
        
        # 4. Тест WebSocket (Принимает ли сервер HTTP-апгрейд)
        print("\n[4/4] Отправка HTTP Upgrade в WebSocket-канал...")
        http_req = (
            f"GET /apiws HTTP/1.1\r\n"
            f"Host: {TARGET_DOMAIN}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n"
            f"Sec-WebSocket-Protocol: binary\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        ).encode('utf-8')
        
        writer.write(http_req)
        await writer.drain()
        
        # Читаем первые 100 байт ответа сервера
        response = await asyncio.wait_for(reader.read(100), timeout=4)
        print("  -> Ответ сервера получен:")
        print("-" * 40)
        print(response.decode('utf-8', errors='ignore').strip())
        print("-" * 40)
        
        writer.close()
        await writer.wait_closed()
        print("\n=== ДИАГНОСТИКА ЗАВЕРШЕНА: СЕТЬ И ВЕБСОКЕТЫ РАБОТАЮТ ===")
        
    except Exception as e:
        print(f"  -> ОШИБКА НА ШАГЕ SSL/WEBSOCKET: {e}")

if __name__ == '__main__':
    asyncio.run(run_diagnostics())
