echo "Installation (intel-ucode for intel OR amd-ucode for amd)"
pacstrap /mnt base linux linux-firmware nano intel-ucode iucode-tool btrfs-progs git wget
genfstab -U /mnt >> /mnt/etc/fstab
