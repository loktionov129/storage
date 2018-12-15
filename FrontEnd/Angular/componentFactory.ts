//https://netbasal.com/dynamically-creating-components-with-angular-a7346f4a982d
//https://plnkr.co/edit/VSctCwNMctHIp4WuHLBy?p=preview

//our root app component
import {Component, NgModule,Input,ComponentFactory,ComponentRef, ComponentFactoryResolver, ViewContainerRef, ChangeDetectorRef, TemplateRef, ViewChild, TemplateRef, Output, EventEmitter, OnInit} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

@Component({
  selector: "alert",
  template: `
    <h1 (click)="output.next('output')">Alert {{type}}</h1>
  `,
})
export class AlertComponent implements OnInit {
  @Input() type: string = "success";
  @Output() output = new EventEmitter();
  
  constructor(){console.warn('constructor');}
  public ngOnInit(){console.warn('constructor');}
}


@Component({
  selector: 'my-app',
  template: `
    <template #alertContainer></template>
    <button (click)="createComponent('success')">Create success alert</button>
    <button (click)="createComponent('danger')">Create danger alert</button>
  `,
})
export class App {
 @ViewChild("alertContainer", { read: ViewContainerRef }) container;
 componentRef: ComponentRef;
 
  constructor(private resolver: ComponentFactoryResolver) {}
  
  createComponent(type) {
    this.container.clear();
    const factory: ComponentFactory = this.resolver.resolveComponentFactory(AlertComponent);

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
  declarations: [ App , AlertComponent],
  g: [AlertComponent],
  bootstrap: [ App ]
})
export class AppModule {}
