#!/usr/bin/node
'use strict';

const https = require('https');

class App {
    findCompanyByName(name) {
        return new Promise((resolve, reject) => {
            const url = 'https://krasnoyarsk.hh.ru/employers_list?query=${name}&areaId=113';
            const request = https.request(url, function(res) {
                console.log("\nstatus code: ", res.statusCode);
                res.on('data', function(data) {
                    resolve((data));
                });
            });
         
            request.end();
            request.on('error', function(err){
                reject(err);
            });
        });
    }

    /* 
     * @args D:\downloads>node main.js qwerty company:"privet" asd:asdf:ghj test=true
     * @return [ { company: 'privet' }, { asd: 'asdf:ghj' } ]
    */
    prepareTerms(args) {
        return args.slice(2)
            .filter((arg) => arg.indexOf(':') !== -1)
            .map((arg) => {
                const chunks = arg.split(':');
                const key = chunks.shift();
                const val = chunks.join(':');
                return {key, val};
            });
    }
};
module.exports = new App();
