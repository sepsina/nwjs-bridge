import {
    ApplicationRef,
    ComponentRef,
    EnvironmentInjector,
    Injectable,
    createComponent,
} from '@angular/core';

import { ModalComponent } from '../modal/modal.component';
import * as gIF from '../gIF';

@Injectable({
    providedIn: 'root',
})
export class ModalService {

    modalComponent!: ComponentRef<ModalComponent>;

    dlgData = {} as any;
    dlgType!: gIF.eDlgType;

    openFlag = false;

    constructor(private appRef: ApplicationRef,
                private injector: EnvironmentInjector) {
        // ---
    }

    /***********************************************************************************************
     * fn          openDlg
     *
     * brief
     *
     */
    async openDlg(){

        let dlgComponent!: ComponentRef<any>;
        let opts = {} as any;

        if(this.openFlag == true){
            return;
        }
        this.openFlag = true;

        opts.environmentInjector = this.injector;
        switch(this.dlgType){
            case gIF.eDlgType.E_ATTR_NAME: {
                const { SetName } = await import('../set-name/set-name');
                dlgComponent = createComponent(SetName, opts);
                break;
            }
            case gIF.eDlgType.E_ATTR_STYLE: {
                const { SetStyles } = await import('../set-styles/set-styles');
                dlgComponent = createComponent(SetStyles, opts);
                break;
            }
        }
        opts.projectableNodes = [[dlgComponent.location.nativeElement]];
        this.modalComponent = createComponent(ModalComponent, opts);
        document.body.appendChild(this.modalComponent.location.nativeElement);

        // Attach views to the changeDetection cycle
        this.appRef.attachView(dlgComponent.hostView);
        this.appRef.attachView(this.modalComponent.hostView);
    }

    /***********************************************************************************************
     * fn          closeDlg
     *
     * brief
     *
     */
    closeDlg() {

        this.modalComponent.location.nativeElement.remove();
        this.openFlag = false;
    }
}
