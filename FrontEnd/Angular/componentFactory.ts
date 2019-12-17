//https://netbasal.com/dynamically-creating-components-with-angular-a7346f4a982d


//our root app component
import {Component, NgModule,Input,ComponentFactory,ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, Output, EventEmitter, Type} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

interface IAlertComponent {
  type: string;
  output: EventEmitter<string>;
}

@Component({
  selector: 'danger-alert',
  template: `
    <h1 (click)="output.next('danger')" style="color: orange">Alert {{type}}</h1>
  `,
})
export class DangerAlertComponent implements IAlertComponent {
  @Input() type: string = 'danger';
  @Output() output = new EventEmitter();
}

@Component({
  selector: 'success-alert',
  template: `
    <h1 (click)="output.next('success')" style="color: green">Alert {{type}}</h1>
  `,
})
export class SuccessAlertComponent implements IAlertComponent{
  @Input() type: string = 'success';
  @Output() output = new EventEmitter();
}


@Component({
  selector: 'app-root',
  template: `
    <template #alertContainer></template>
    <button (click)="createComponent('success', components.success)">Create success alert</button>
    <button (click)="createComponent('danger', components.danger)">Create danger alert</button>
  `,
})
export class App {
 @ViewChild("alertContainer", { read: ViewContainerRef, static: false })
  container: ViewContainerRef;

  componentRef: ComponentRef<IAlertComponent>;

  components = {
    success: SuccessAlertComponent,
    danger: DangerAlertComponent
  }
 
  constructor(private resolver: ComponentFactoryResolver) {}
  
  createComponent(type: string, component: Type<IAlertComponent>) {
    this.container.clear();
    const factory: ComponentFactory<IAlertComponent> = this.resolver.resolveComponentFactory(component);

    this.componentRef = this.container.createComponent(factory);
    
    this.componentRef.instance.type = type;

    this.componentRef.instance.output.subscribe(event => console.log(event));

  }
  
    ngOnDestroy() {
      this.componentRef.destroy();    
    }
}

@NgModule({
  imports: [ BrowserModule ],
  declarations: [ App , DangerAlertComponent, SuccessAlertComponent],
  entryComponents: [DangerAlertComponent, SuccessAlertComponent],
  bootstrap: [ App ]
})
export class AppModule {}
