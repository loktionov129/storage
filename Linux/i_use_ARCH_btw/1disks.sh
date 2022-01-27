DISK_EFI=$1
DISK_MAIN=$2

echo Format partitions
mkfs.vfat /dev/$DISK_EFI
mkfs.btrfs /dev/$DISK_MAIN -f

echo Configure storage
mount /dev/$DISK_MAIN /mnt
cd /mnt
btrfs subvolume create @
btrfs subvolume create @home
btrfs subvolume create @var
cd
umount /mnt

mount -o ssd,noatime,compress=zstd,space_cache=v2,discard=async,subvol=@ /dev/$DISK_MAIN /mnt
mkdir -p /mnt/boot/efi
mkdir /mnt/{home,var}
mount -o ssd,noatime,compress=zstd,space_cache=v2,discard=async,subvol=@home /dev/$DISK_MAIN /mnt/home
mount -o ssd,noatime,compress=zstd,space_cache=v2,discard=async,subvol=@var /dev/$DISK_MAIN /mnt/var
mount /dev/$DISK_EFI /mnt/boot/efi
