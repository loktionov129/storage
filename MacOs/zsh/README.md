# README.md

https://medium.com/@elviocavalcante/5-steps-to-improve-your-terminal-appearance-on-mac-osx-f58b20058c84

https://github.com/robbyrussell/oh-my-zsh/blob/master/plugins/git/git.plugin.zsh



Source Code Pro Black for Powerline

https://github.com/powerline/fonts/tree/master/SourceCodePro

---

---

iterm2

https://www.iterm2.com/downloads.html

---

brew

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

---

zsh

oh-my-zsh

```
brew install zsh

sh -c “$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

---

~/.zshrc
```
# remove old robbyrussell theme and set agnoster
ZSH_THEME="agnoster"

prompt_context() {
 if [[ “$USER” != “$DEFAULT_USER” || -n “$SSH_CLIENT” ]]; then
   prompt_segment blue  default
 fi
}
```

---

~/.bash_profile
```
source ~/.git_alias
```