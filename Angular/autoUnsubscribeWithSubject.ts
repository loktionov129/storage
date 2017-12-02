import { Component, OnDestroy, OnInit } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { MyThingService } from '../my-thing.service';

@Component({
    selector: 'my-thing',
    templateUrl: './my-thing.component.html'
})
export class MyThingComponent implements OnDestroy, OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private myThingService: MyThingService,
    ) { }

    ngOnInit() {
        this.myThingService.getThings()
            .takeUntil(this.ngUnsubscribe)
            .subscribe(things => console.log(things));

        this.myThingService.getOtherThings()
            .takeUntil(this.ngUnsubscribe)
            .subscribe(things => console.log(things));

    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
