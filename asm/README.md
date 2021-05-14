### ASM


```
apt-get update
apt-get install --reinstall binutils
apt-get install -y nasm
```


```
nasm -f elf32 -o main.o main.asm
ld -m elf_i386 -o app main.o
./app
```
