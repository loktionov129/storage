import { Component, OnDestroy, OnInit } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { MyThingService } from '../my-thing.service';

@Component({
    selector: 'my-thing',
    templateUrl: './my-thing.component.html'
})
export class MyThingComponent implements OnDestroy, OnInit {
    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private myThingService: MyThingService,
    ) { }

    ngOnInit() {
        this.myThingService.getThings()
            .takeUntil(this.componentDestroyed$)
            .subscribe(things => console.log(things));

        this.myThingService.getOtherThings()
            .takeUntil(this.componentDestroyed$)
            .subscribe(things => console.log(things));

    }

    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.unsubscribe();
    }
}
