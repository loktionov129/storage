#!/usr/bin/env bash

bind()
{
    unalias $1 &> /dev/null
    alias $1="$2"
}

bind gf 'git fetch --all --prune'
bind gfa 'git fetch --all --prune'
bind gpl 'git pull origin $(git symbolic-ref --short HEAD)'
bind gplo 'git pull origin $(git symbolic-ref --short HEAD)'

bind gco 'git checkout'
bind gcb 'git checkout -b'

bind gs 'git status'

bind ga 'git add .'
#bind gc 'sh -c '\''git commit -m "$(git symbolic-ref --short HEAD)" -m "$*"'\'' _'
bind gc 'git commit -m '
bind gca 'git commit -v --no-edit --amend'
bind gcam 'git commit -v --amend -m'

bind gp 'git push'
bind gpo 'git push origin $(git symbolic-ref --short HEAD)'
bind gpn 'git push origin $(git symbolic-ref --short HEAD) --no-verify'
bind gpfn 'git push origin $(git symbolic-ref --short HEAD) --no-verify --force'
bind gpnf 'git push origin $(git symbolic-ref --short HEAD) --no-verify --force'

bind gd 'git diff'
bind gl 'git log'

bind grs 'git reset --soft HEAD^1'
bind grh 'git reset --hard HEAD^1'
