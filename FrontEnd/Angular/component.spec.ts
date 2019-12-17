import {mock, verify, when} from 'ts-mockito';
import {ComponentFixture, TestBed} from '@angular/core/testing';

export function providerOf(token: any, mock: any): Provider {
    return {
        provide: token,
        useFactory: () => instance(mock)
    };
}

describe(`${component.name} | Компонент для чего-то:`, () => {
    let component: component;
    let fixture: ComponentFixture<component>;
    let apiServiceMock: ApiService;

    let items$: BehaviorSubject<Item[]>;

    beforeEach(() => {
        apiServiceMock = mock(ApiService);

        items$ = new BehaviorSubject([] as Item[]);
        when(apiServiceMock.get$()).thenReturn(items$.asObservable());
    });

    beforeEach(() => {
        fixture = TestBed
            .configureTestingModule({
                declarations: [component],
                providers: [
                    // providerOf(ModuleProvider, moduleProviderMock)
                ]
            })
            .overrideComponent(component, {
                set: {
                    providers: [
                        providerOf(ApiService, apiServiceMock)
                    ]
                }
            })
            .overrideTemplate(component, '')
            .createComponent(component);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('инициализация', () => {
        it('получить список items', () => {
            verify(apiServiceMock.get$()).once();
        });
    });

    it('--------', () => {
        items$.next([new Item()]);
        
        //apiServiceMock.get$()
    });
});










/* toHaveBeenCalledWith  */


    it('probros', () => {
        service.showInfoPopup();
        verify(popupServiceMock.showPopup(deepEqual(params))).once();
    });
    
    it('kaptur', () => {
        service.showInfoPopup();
        const [params] = capture(popupServiceMock.showPopup).last();
        expect(params).toEqual({...});
    });
    

    it('debounceTime', fakeAsync(() => {
        sub$.emit(42);
        tick(DEBOUNCE_TIME);
        expect...
    }));
