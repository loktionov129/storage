// https://metanit.com/web/angular2/2.9.php

import { Component} from '@angular/core';
       
@Component({
    selector: 'my-app',
    template: `<child-comp #counter></child-comp>
                <button (click)="increment()">+</button>
                <button (click)="decrement()">-</button>`
})
export class AppComponent { 
 
    increment() { this.counter++; }
    decrement() { this.counter--; }
}

/*Чтобы иметь возможность обращаться к методам и прочей функциональности дочернего компонента
  надо использовать декоратор ViewChild. Так, изменим главный компонент следующим образом:*/
  
import { Component, ViewChild } from '@angular/core';
import { ChildComponent} from './child.component';
       
@Component({
    selector: 'my-app',
    template: `<child-comp></child-comp>
                <button (click)="increment()">+</button>
                <button (click)="decrement()">-</button>`
})
export class AppComponent { 
 
    @ViewChild(ChildComponent)
    private counterComponent: ChildComponent;
     
    increment() { this.counterComponent.increment(); }
    decrement() { this.counterComponent.decrement(); }
}

/* С помощью применения к нему декоратора ViewChild к свойству counterComponent мы устанавливаем,
  что это свойство будет содержать объект дочернего компонента, который внедряется через элемент <child-comp></child-comp>.
  И в этом случае мы уже можем не использовать шаблонные переменные в шаблоне.*/
