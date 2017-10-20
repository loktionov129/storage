#!/usr/bin/node
'use strict';

const cheerio = require('cheerio');
const needle = require('needle');

const findVacancies = (page) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            needle.get(`http://localhost/?page=${page}`, (error, response) => {
                if (!error && response.statusCode == 200) {
                    resolve(response.body);
                }
                reject({error, response});
            });
        }, 1000);
    });
};

(async function main() {
    console.warn('start:: ', new Date());
    
    const vacanciesList = [];
    const pagesCount = 5;
    for (let page = 0; page < pagesCount; ++page) {
        console.warn(`page#${page}:: `, new Date());
        vacanciesList.push(await findVacancies(page));
    }
    
    console.warn(vacanciesList);
    console.warn('end:: ', new Date());
})();


/* ================
       index.php
   ================ */
   
<?php
$page = isset($_GET['page']) ? intval($_GET['page']) : 0;
$date = date('H:i:s');
echo "[$date] page #$page";


/* ================ 
     !! RESULT !!
   ================ */

alex@linux /media/alex/D/dev/hhparser $ node main.js 
start::  2017-10-20T13:53:24.198Z
page#0::  2017-10-20T13:53:24.201Z
page#1::  2017-10-20T13:53:25.240Z
page#2::  2017-10-20T13:53:26.245Z
page#3::  2017-10-20T13:53:27.248Z
page#4::  2017-10-20T13:53:28.252Z
[ '[20:53:25] page #0',
  '[20:53:26] page #1',
  '[20:53:27] page #2',
  '[20:53:28] page #3',
  '[20:53:29] page #4' ]
end::  2017-10-20T13:53:29.258Z
alex@linux /media/alex/D/dev/hhparser $ 
