*/
http://plnkr.co/edit/unDaCeagoJRVROh8weYX?p=preview
*/

@Component({
    selector: 'my-app',
    template: `<child-comp [(userName)]="name"></child-comp>
                <div>Выбранное имя: {{name}}</div>`
})
export class App {
   name: string = "Tom";
}


@Component({
    selector: 'child-comp',
    template: `<input [ngModel]="userName" (ngModelChange)="onNameChange($event)" />`
})
export class Child {
    @Input() userName:string;
    @Output() userNameChange = new EventEmitter<string>();
    onNameChange(model: string){
         
        this.userName = model;
        this.userNameChange.emit(model);
    }
}
