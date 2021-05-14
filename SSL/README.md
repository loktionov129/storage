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

