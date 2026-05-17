# DO NOT USE WINDOWS FOR PROGRAMMING !!!

## Pre-INstall
- autounattend.xml
* https://github.com/memstechtips/UnattendedWinstall

## Post-INstall

` notepad ~/.bashrc`

```bashsh
if [ -f /etc/profile.d/git-prompt.sh ]; then
  . /etc/profile.d/git-prompt.sh
fi

export GIT_PS1_SHOWDIRTYSTATE=1
export GIT_PS1_SHOWUNTRACKEDFILES=1
export GIT_PS1_SHOWSTASHSTATE=1
export GIT_PS1_SHOWUPSTREAM="auto"

# Зеленый ник, желтая короткая папка, бирюзовый git
export PS1="\[\033[32m\]\u \[\033[33m\]\W\[\033[36m\]\$(__git_ps1 \" (%s)\")\[\033[0m\] $ "

```
