function logable(target: Object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, key) as PropertyDescriptor;

    let originalMethod = descriptor.value;
    let log: string[] = [];

    descriptor.value = function () {
        let args = [];
        for (let i = 0; i < arguments.length; i++) {
            args[i - 0] = arguments[i];
        }
        let a = args.map((b) => JSON.stringify(b)).join();
        let result = originalMethod.apply(this, args);
        log.push(`Call: ${key}(${a}) => ${result}`);
        return result;
    };

    descriptor.value['log'] = log;
    return descriptor;
}

class MyMath {
    @logable
    public static sum(...args: number[]): number {
        return [...args].reduce((a, b) => a + b, 0);
    }
}

MyMath.sum(42, 69);
MyMath.sum(845, 43, 14, 45, 74, 45);
MyMath.sum(1, 2, 3, 4, 5);

console.warn(MyMath.sum['log']);

/*
Call: sum(42,69) => 111
Call: sum(845,43,14,45,74,45) => 1066
Call: sum(1,2,3,4,5) => 15
*/

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

function logable(target, key, descriptor) {
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, key);
    var originalMethod = descriptor.value;
    var log = [];
    descriptor.value = function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i - 0] = arguments[i];
        }
        var a = args.map(function (b) { return JSON.stringify(b); }).join();
        var result = originalMethod.apply(this, args);
        log.push("Call: " + key + "(" + a + ") => " + result);
        return result;
    };
    descriptor.value['log'] = log;
    return descriptor;
}

var MyMath = /** @class */ (function () {
    function MyMath() {
    }
    MyMath.sum = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.slice().reduce(function (a, b) { return a + b; }, 0);
    };
    __decorate([
        logable
    ], MyMath, "sum", null);
    return MyMath;
}());

MyMath.sum(42, 69);
MyMath.sum(845, 43, 14, 45, 74, 45);
MyMath.sum(1, 2, 3, 4, 5);

console.warn(MyMath.sum['log']);
