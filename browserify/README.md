sudo npm install --global browserify
<br>
sudo npm install --global exorcist
<br>
browserify --debug src/main.js | exorcist build/bundle.map.js > build/bundle.js