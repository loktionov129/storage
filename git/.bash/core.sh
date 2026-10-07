#!/usr/bin/env bash

# Функция для безопасного создания алиасов
bind() {
    unalias "$1" &> /dev/null
    alias "$1"="$2"
}

bind cls 'clear'

bind fixlock 'killall kscreenlocker_greet; echo "NVIDIA F|_|CK YOU (C) LINUS"'
