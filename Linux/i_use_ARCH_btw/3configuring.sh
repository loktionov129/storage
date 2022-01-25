USER_LOGIN=$1
USER_PASSWORD=$2
ROOT_LOGIN=$3
ROOT_PASSWORD=$4

ln -sf /usr/share/zoneinfo/Asia/Krasnoyarsk /etc/localtime
hwclock --systohc
sed -i '177s/.//' /etc/locale.gen
cat /etc/locale.gen | grep en_US
echo "Ensure that en_US.UTF-8 is uncommented"
locale-gen
echo "LANG=en_US.UTF-8" >> /etc/locale.conf
echo "arch" >> /etc/hostname
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1       localhost" >> /etc/hosts
echo "127.0.1.1 arch.localdomain arch" >> /etc/hosts
echo $ROOT_LOGIN:$ROOT_PASSWORD | chpasswd

echo "Install packages"
pacman -S base-devel linux-headers neofetch htop reflector
pacman -S grub grub-btrfs efibootmgr
pacman -S networkmanager network-manager-applet wpa_supplicant
pacman -S mtools dosfstools os-prober dialog 
pacman -S xdg-user-dirs xdg-utils cups hplip openssh rsync firewalld
pacman -S alsa-utils pipewire pipewire-alsa pipewire-pulse pipewire-jack pavucontrol

echo "Install GRUB as bootloader"
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

echo "Configure the system again [1]"
gpg --refresh-keys
pacman -Syu
pacman-key --refresh-keys
pacman -S gnome
pacman -S --noconfirm nvidia-dkms nvidia-utils lib32-nvidia-utils nvidia-settings vulkan-icd-loader lib32-vulkan-icd-loader lib32-opencl-nvidia opencl-nvidia libxnvctrl 
pacman -S --noconfirm lib32-mesa vulkan-intel lib32-vulkan-intel vulkan-icd-loader lib32-vulkan-icd-loader libva-intel-driver xf86-video-intel
systemctl enable gdm
systemctl enable NetworkManager
systemctl enable cups.service
systemctl enable reflector.timer
systemctl enable fstrim.timer
systemctl enable firewalld
useradd -m $USER_LOGIN
echo $USER_LOGIN:$USER_PASSWORD | chpasswd
echo "$USER_LOGIN ALL=(ALL) ALL" >> /etc/sudoers.d/$USER_LOGIN
echo "QT_QPA_PLATFORM=wayland" >> /etc/environment
echo "MOZ_ENABLE_WAYLAND=1" >> /etc/environment
echo "MOZ_WEBRENDER=1" >> /etc/environment
echo "XDG_SESSION_TYPE=wayland" >> /etc/environment
echo "XDG_CURRENT_DESKTOP=GNOME" >> /etc/environment
