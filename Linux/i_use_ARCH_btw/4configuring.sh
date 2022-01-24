sudo timedatectl set-ntp true
sudo hwclock --systohc
sudo reflector --verbose -l 10 -p https --sort rate -a 12 --save /etc/pacman.d/mirrorlist
sudo pacman -Syy
sudo firewall-cmd --add-port=1025-65535/tcp --permanent
sudo firewall-cmd --add-port=1025-65535/udp --permanent
sudo firewall-cmd --reload

# Install packages
sudo pacman -S --noconfirm xorg-xwayland qt5-wayland firefox-developer-edition

# aur
mkdir -p ~/Projects/aur
cd ~/Projects/aur
git clone https://aur.archlinux.org/paru.git
cd paru
makepkg -si --noconfirm
cd ..

# system-backup\restore
paru -S --noconfirm timeshift timeshift-autosnap nerd-fonts-jetbrains-mono
sudo systemctl disable getty@tty2.service
