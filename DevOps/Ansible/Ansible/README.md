# Ansible

## Execute main playbook
`ansible-playbook playbook.yml`

## Execute a role via Ad-Hoc
`ansible all -m include_role -a name=example.ping -b`

---

## Generate a role
`(cd roles && ansible-galaxy init __role_name__)`

---

## Encrypt/Decrypt via ansible-vault
`ansible-vault __create|view|edit|encrypt|decrypt__ /path/to/file`

## Change password for file
`ansible-vault rekey /path/to/file`

## Execute encrypted playbook
```
ansible-playbook playbook.yml --ask-vault-pass
ansible-playbook playbook.yml --vault-password-file /path/to/password.txt
```

## Generate encrypted string
`echo -n "secretword" | ansible-vault encrypt_string`

---
