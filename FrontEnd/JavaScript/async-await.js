function add(x, y) {
	return new Promise( function(resolve, reject) {
		setTimeout( () => x>0 ? resolve(x+y) : reject("x should be >0"), 1000);		
    });
}

(async function() {
	console.log("async started");
	var res1 = await add(2, 3);
	console.log("res1: ", res1);

	var res2 = await add(res1, 4);
	console.log("res2: ", res2);
	return res2;
})();

/*
11:40:26 VM785:2 async started
11:40:26 Promise {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}
11:40:28 VM785:4 res1:  5
11:40:30 VM785:7 res2:  9
*/
