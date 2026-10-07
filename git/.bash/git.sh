#!/usr/bin/env bash

bind gf 'git fetch --all --prune'
bind gfa 'git fetch --all --prune'
bind gpl 'git pull origin $(git symbolic-ref --short HEAD)'
bind gplo 'git pull origin $(git symbolic-ref --short HEAD)'

bind gco 'git checkout'
bind gcb 'git checkout -b'

bind gs 'git status'

bind gp 'git push'
bind gpo 'git push origin $(git symbolic-ref --short HEAD)'
bind gpn 'git push origin $(git symbolic-ref --short HEAD) --no-verify'
bind gpfn 'git push origin $(git symbolic-ref --short HEAD) --no-verify --force'
bind gpnf 'git push origin $(git symbolic-ref --short HEAD) --no-verify --force'

bind gd 'git diff'
bind gl 'git log'

bind grs 'git reset --soft HEAD^1'
bind grh 'git reset --hard HEAD^1'

bind ga 'git add .'
#bind gc 'sh -c '\''git commit -m "$(git symbolic-ref --short HEAD)" -m "$*"'\'' _'
bind gc 'git commit -m '
bind gca 'git commit -v --no-edit --amend'
bind gcam 'git commit -v --amend -m'
bind gcl 'git branch -a | grep -vE "master|main|remotes|\*" | xargs git branch -D'

# Коммит с автоматической подписью Claude в футере (Co-authored-by)
gccl() {
    if [ -z "$*" ]; then
        echo "Ошибка: Укажите сообщение коммита."
        echo "Пример: gccl 'feat(auth): add login page'"
        return 1
    fi
    
    git commit -m "$*" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
}

gm() {
    local remote="$1"
    local main_branch=""

    # 1. Если аргумент пустой, предлагаем дефолтный origin через интерактивный промпт
    if [ -z "$remote" ]; then
        # Флаг -n1 считывает ровно 1 символ, -r отключает экранирование backslash
        read -n 1 -r -p "Ремоут не указан. Использовать 'origin' по умолчанию? [Y/n] " response
        echo "" # Перенос строки после нажатия клавиши
        
        # Если нажали Enter (пустой ответ) или Y/y — выставляем origin
        if [ -z "$response" ] || [[ "$response" =~ ^[Yy]$ ]]; then
            remote="origin"
        else
            echo "Отменено. Укажите имя ремоута явно. Пример: gm base"
            return 1
        fi
    fi

    # 2. Надежная проверка веток (независимая от регистра букв в Windows)
    if git branch -r | grep -qi "^  $remote/main$"; then
        main_branch="main"
    elif git branch -r | grep -qi "^  $remote/master$"; then
        main_branch="master"
    else
        echo "Ошибка: В ремоуте '$remote' не найдены ветки main или master."
        echo "Доступные ветки этого ремоута:"
        git branch -r | grep "^  $remote/"
        return 1
    fi

    # 3. Получение текущей локальной ветки
    local current_branch=$(git branch --show-current)

    # 4. Защита от слияния ветки самой в себя
    if [ "${current_branch,,}" = "${main_branch,,}" ]; then
        echo "Вы уже находитесь на главной ветке ($main_branch). Слияние отменено."
        return 1
    fi

    # 5. Выполнение слияния
    echo "Merging $remote/$main_branch into '$current_branch'..."
    git merge "$remote/$main_branch"
}
