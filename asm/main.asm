global _start

section .text:

_start:
    mov eax, 0x4             ; kernel write (system call)
    mov ebx, 0x1             ; stdout (file descriptor)
    mov ecx, message
    mov edx, message_length
    int 0x80                 ; invoke write

    mov eax, 0x1             ; kernel exit
    mov ebx, 0x0             ; return code
    int 0x80                 ; exit

section .data:
    message: db "Hello World!", 0xA
    message_length equ $-message
