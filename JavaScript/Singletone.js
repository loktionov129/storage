/**
 * Bulletproof singletone constructor. Can be used with or 
 * without new, can be called from whatever (object method,
 * standalone function). Works fine in strict mode
 */
const Basket = (function () {
	let instance;

	return function BasketConstructor () {
		if (instance) {
			return instance;
		}
    
		if (this && this.constructor === BasketConstructor) {
			instance = this;
		} else {
			return new BasketConstructor();
		}

		let items = [];
		this.push = (item) => items.push(item);
		this.show = () => items.forEach( (item, index) =>
    	document.querySelector("#result").innerHTML += `items[${index}] = ${item}<br>`
    );
		this.removeAt = (index) => {
    	let item = items.splice(index, 1).shift();
    	document.querySelector("#result").innerHTML +=  `remove: items[${index}] = ${item}<br>`;
    };
	};
}());

// Tests:

const saleBasket = new Basket();

for (let i = 0; i < 5; ++i) {
	saleBasket.push( parseInt(Math.random() * 100) );
}

saleBasket.show();
document.querySelector("#result").innerHTML += "<br>";

(new Basket()).removeAt(2);
document.querySelector("#result").innerHTML += "<br>";

var test = Basket();
test.show();


/*
Разберем что происходит в возвращаемой функции.
Если есть instance, то возвращаем его.
Если функция используется с new или без, все равно мы вернем ссылку на объект, сконструированный этой функцией.

Если функция вызвана с new, то this ссылается на объект, конструируемый этой функцией.
This так же может быть определен, если функция вызвана в нестрогом режиме (this === window),
или если функция вызвана как метод объекта (this === этот_объект).
Второй случай аннигилируется проверкой конструктора у this.

Если this не определен (вызов в строгом), или конструктор у this не текущая функция,
возвращаем результат текущей функции с new.

Имеем на выходе пуленепробиваемый конструктор синглтона, который можно где угодно хранить и как угодно вызывать.

http://dmitrypodgorniy.com/blog/all/singlton-na-javascript/
*/
