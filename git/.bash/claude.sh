claude() {
    # Имя твоего основного WireGuard туннеля
    local DEFAULT_TUNNEL="u100-500"

    # Собираем все подключенные интерфейсы
    local active_interfaces
    active_interfaces=$(netsh interface show interface | grep -E "Connected|Подключен")

    # Ищем наш точный туннель DEFAULT_TUNNEL
    # ИЛИ любой другой кастомный vpn-адаптер
    if echo "$active_interfaces" | grep -q "$DEFAULT_TUNNEL" || \
       echo "$active_interfaces" | grep -ivE "Ethernet|Wireless|Беспроводная|Kerio" | grep -q .; then
        
        # Если VPN найден, вызываем настоящий бинарник claude со всеми переданными аргументами
        command claude "$@"
    else
        # Если туннеля нет, блокируем запуск
        echo "ERROR: VPN NOT FOUND! Enable wireguard before running Claude."
        return 1
    fi
}
