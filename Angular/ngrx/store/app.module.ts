import { StoreModule } from '@ngrx/store';
import { counterReducer } from './counter.store';
import { NgrxStoreComponent } from './ngrx-store.component';

@NgModule({
    declarations: [
        NgrxStoreComponent
    ],
    imports: [
        StoreModule.forRoot({ counter: counterReducer })
    ],
})
export class AppModule { }
