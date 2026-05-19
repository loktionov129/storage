# os

## Git

```bash
git config --global core.editor "nano"
git config --global user.name "Aleksandr Loktionov"
git config --global user.email "loktionov129@gmail.com"
ssh-keygen -t ed25519 -C "loktionov129@gmail.com"

#win
eval "$(ssh-agent -s)"
#lin
eval (ssh-agent -c)


ssh-add ~/.ssh/id_ed25519

cat ~/.ssh/id_ed25519.pub
# https://github.com/settings/ssh/new
```
