{
  "version": 3,
  "sources": [
    "../../../../../usr/local/lib/node_modules/browserify/node_modules/browser-pack/_prelude.js",
    "src/main.js",
    "src/myModule.js"
  ],
  "names": [],
  "mappings": "AAAA;ACAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACTA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA",
  "file": "generated.js",
  "sourceRoot": "",
  "sourcesContent": [
    "(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})",
    "/*jshint esversion: 6 */\n;(function(){\n\t\"use strict\";\n\n\tvar fn = require('./myModule.js').fn;\n\tvar data = require('./myModule.js').data;\n\t\n\tfn();\n\tconsole.log(data);\n})();",
    "/*jshint esversion: 6 */\n;(function(){\n\t\"use strict\";\n\n\tmodule.exports = {\n\t\tdata: 'Hello browserify',\n\t\tfn: () => console.log('welcome!')\n\t};\n})();"
  ]
}