#!/usr/bin/node
'use strict';

const config = require('./config');
const App = require('./app');
const fs = require('fs');

(async function main(args) {
    if (args.length <= 2) {
        console.log('usage: node main.js company:"facebook"');
        return;
    }
    
    const terms = App.prepareTerms(args);
    for (const term of terms) {
        switch (term.key.toLowerCase()) {
            case 'company': {
                const result = await App.findCompanyByName(term.value);
                var stream = fs.createWriteStream("tmp.txt");
                stream.once('open', (fd) => {
                    stream.write(result);
                    stream.end();
                });
                break;
            }
                
            case 'something': {
                // someFunc(term.value);
                break;
            }
            default: break;
        }
    }
})(process.argv);
