sudo timedatectl set-ntp true
sudo hwclock --systohc
sudo reflector --verbose -l 10 -p https --sort rate -a 12 --save /etc/pacman.d/mirrorlist
sudo pacman -Syy
sudo firewall-cmd --add-port=1025-65535/tcp --permanent
sudo firewall-cmd --add-port=1025-65535/udp --permanent
sudo firewall-cmd --reload
sudo systemctl disable getty@tty2.service

