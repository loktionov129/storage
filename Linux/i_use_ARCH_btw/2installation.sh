echo "Installation (intel-ucode for intel OR amd-ucode for amd)"
pacstrap /mnt base linux linux-firmware nano intel-ucode btrfs-progs git
genfstab -U /mnt >> /mnt/etc/fstab
