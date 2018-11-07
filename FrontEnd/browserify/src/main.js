/*jshint esversion: 6 */
;(function(){
	"use strict";

	var fn = require('./myModule.js').fn;
	var data = require('./myModule.js').data;
	
	fn();
	console.log(data);
})();