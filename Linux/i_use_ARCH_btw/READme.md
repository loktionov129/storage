# Update the system clock
```
timedatectl set-ntp true
```

# Partition the disks
```
lsblk
fdisk -l
gdisk /dev/sda
```
## Create a new empty GUID partition table (GPT)
```
o
y
```
## Add a new EFI partition
```
n
# Partition number (default: 1)
# First sector memory (default: 2048)
# Last sector memory
+550M
# Hex code or GUID
ef00
```
## Add a new MAIN partition
```
n

# Partition number (default: 2)
# First sector memory (default)
# Last sector memory
-2G
# Hex code or GUID (default: 8300)
# Write table to disk and exit
w
Y
```

## Disks
```
pacman -Syu
cd /tmp
pacman -S wget
wget https://raw.githubusercontent.com/loktionov129/storage/master/Linux/i_use_ARCH_btw/1disks.sh
sed -i 's/\r$//' ./1disks.sh
chmod +x ./1disks.sh
./1disks.sh sda1 sda2
```

## Installation
```
wget https://raw.githubusercontent.com/loktionov129/storage/master/Linux/i_use_ARCH_btw/2installation.sh
sed -i 's/\r$//' ./2installation.sh
chmod +x ./2installation.sh
./2installation.sh
```

## Configure the system
```
arch-chroot /mnt

echo "Enable multilib in /etc/pacman.conf"
nano /etc/pacman.conf
cd /tmp
wget https://raw.githubusercontent.com/loktionov129/storage/master/Linux/i_use_ARCH_btw/3configuring.sh
sed -i 's/\r$//' ./3configuring.sh
chmod +x ./3configuring.sh
./3configuring.sh admin password root password

exit
umount -R /mnt
reboot
```

# Login and configure the system again [2]
```
# if btrFS used on 2 disks - put "btrfs" parameter in MODULES
# if amd or nvidia card is used - put "amdgpu" or "nvidia" parameters in MODULES accordingly
# (crc32c libcrc32c zlib_deflate btrfs nvidia nvidia_modeset nvidia_uvm nvidia_drm)
# if config was changed, recreate initramfs:

nano /etc/mkinitcpio.conf
mkinitcpio -p linux
reboot
```

# Login and configure the system again [3]
```
cd /tmp
wget https://raw.githubusercontent.com/loktionov129/storage/master/Linux/i_use_ARCH_btw/4configuring.sh
sed -i 's/\r$//' ./4configuring.sh
chmod +x ./4configuring.sh
./4configuring.sh

echo "https://wiki.archlinux.org/title/NVIDIA#DRM_kernel_mode_setting"
echo "Create pacman hook for nvidia"

reboot
```

# Login and configure the system again [4]
```
neofetch

echo "change region formats via settings, windows titlebars via tweaks, dark theme and etc..."

paru -S lutris wine-staging gamemode lib32-gamemode mangohud lib32-mangohud steam
echo steam --->> settings --> steam play --> enable proton
paru -S proton-ge-custom − ставится долго.

ln -s /usr/share/steam/compatibilitytools.d/proton-ge-custom/files ~/.local/share/lutris/runners/wine/proton-ge-custom
ln -s ~/.local/share/Steam/steamapps/common/Proton\ 6.3/dist ~/.local/share/lutris/runners/wine/Proton\ 6.3

echo "manage wine versions via lutris, add latest protons"
echo "configure lutris runner options: disable mouse war override, enable audio driver=pulseaudio"
echo "configure lutris system options: enable restore resolution+gamma on game exit, disable desktop effects, disable screensaver, set vulkan icd=nvidia, enable feral gamemode, env vars - MANGOHUD=1"

nano ~/.config/MangoHud/MangoHud.conf
cpu_temp
gpu_temp
fps_limit=100
or fps_limit=144
or fps_limit=240
```
