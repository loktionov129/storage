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


/*Привязка ViewChild к шаблонным переменным

Несмотря на то, что выше мы не использовали переменные,
тем не менее с помощью декоратора ViewChild также можно связать свойство и переменную из шаблона.
Так, изменим код главного компонента:*/

import { Component, ViewChild } from '@angular/core';
       
@Component({
    selector: 'my-app',
    template: `<p #nameParagraph>{{name}}</p>
               <p>{{nameParagraph.textContent}}</p>
               <button (click)="change()">Изменить</button>`
})
export class AppComponent { 
 
    @ViewChild("nameParagraph")
    nameParagraph: HTMLElement;
     
    name: string = "Tom";
     
    change() { 
        console.log(this.nameParagraph.nativeElement.textContent); 
        this.nameParagraph.nativeElement.textContent = "hell";
    }
}

/* Здесь в шаблоне определяется переменная nameParagraph, которая представляет код параграфа.
А в декоратор ViewChild передается имя этой переменной.
Поэтому свойство nameParagraph, к которому применяется декоратор, будет указывать на эту переменную.

По нажатию на кнопку выводится и изменяется текстовое содержимое этой переменной.
*/
