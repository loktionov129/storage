(async () => {
    for (let prev = -1, cur = 0; (cur = document.body.scrollHeight) != prev; prev = cur)
    {
		console.log(new Date().toString());
        window.scrollTo(0,document.body.scrollHeight);
        await new Promise((resolve) => {
			setTimeout(() => resolve(), 1000);
		});
    }
})();
