# RSA

## txt

```sh
/**
* Date: May 13, 2021
* Author: ADV-IT
* Source: https://www.youtube.com/watch?v=mgZNyh2lJJU&ab_channel=ADV-IT
*/


ssh-keygen.exe -t rsa -b 4096 -m PEM -f cryptoKey
ssh-keygen -f cryptoKey.pub -e -m PKCS8 > cryptoKey.public
rm -rf cryptoKey.pub
mv cryptoKey cryptoKey.private

echo 'Hello \r\n
abcdefghwp' > message.txt

cat message.txt

openssl rsautl -encrypt -pubin -inkey cryptoKey.public -in message.txt -out encryptedMessage.txt
cat encryptedMessage.txt

openssl rsautl -decrypt -inkey cryptoKey.private -in encryptedMessage.txt -out decryptedMessage.txt
cat decryptedMessage.txt
```

---

## mp4

```bash
# 1. Генерируем пару ключей RSA
ssh-keygen -t rsa -b 2048 -f cryptoKey -N ""

# 2. Конвертируем публичный ключ в PKCS8
ssh-keygen -f cryptoKey.pub -e -m PKCS8 > cryptoKey.public

# 3. Удаляем старый публичный ключ
rm -rf cryptoKey.pub

# 4. Переименовываем приватный ключ
mv cryptoKey cryptoKey.private

# 5. Конвертируем приватный ключ в PEM формат
ssh-keygen -p -f cryptoKey.private -m PEM -N ""

# 6. Генерируем AES-ключ
openssl rand -out aes_key.bin 32

# 7. Зашифровываем видео AES
openssl enc -aes-256-cbc -salt -in ../demo.mp4 -out encrypted_demo.mp4.enc -pass file:aes_key.bin

# 8. Зашифровываем AES-ключ RSA (создаёт encrypted_aes_key.bin)
openssl pkeyutl -encrypt -pubin -inkey cryptoKey.public -in aes_key.bin -out encrypted_aes_key.bin

# 9. Расшифровываем AES-ключ RSA
openssl pkeyutl -decrypt -inkey cryptoKey.private -in encrypted_aes_key.bin -out aes_key_decrypted.bin

# 10. Расшифровываем видео AES
openssl enc -d -aes-256-cbc -in encrypted_demo.mp4.enc -out demo_decrypted.mp4 -pass file:aes_key_decrypted.bin

# 11. Проверка
cmp ../demo.mp4 demo_decrypted.mp4 && echo "УСПЕХ" || echo "ОШИБКА"
```
