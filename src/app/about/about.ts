import {
    Component,
    OnInit,
    HostBinding
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { UtilsService } from '../services/utils.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import * as gConst from '../gConst';
import * as gIF from '../gIF'

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './about.html',
    styleUrls: ['./about.scss']
})
export class About implements OnInit {

    @HostBinding('attr.id') hostID = 'about-dlg';

    recs: string[] = [];
    title = '';

    constructor(
        private modal: ModalService,
        public utils: UtilsService
    ) {
        // ---
    }

    /***********************************************************************************************
     * @fn          ngOnInit
     *
     * @brief
     *
     */
    ngOnInit(): void {
        const attr = <gIF.hostedAttr_t>this.modal.dlgData.attr;
        this.title = attr.name;
        let partDesc: gIF.part_t = this.modal.dlgData.partsMap.get(attr.partNum);
        if(partDesc) {
            this.recs.push(`node: ${partDesc.devName}`);
            this.recs.push(`part: ${partDesc.part}`);
            this.recs.push(`S/N: ${this.utils.extToHex(attr.extAddr)}`);
            this.recs.push(`url: ${partDesc.url}`);
        }
    }

    /***********************************************************************************************
     * @fn          close
     *
     * @brief
     *
     */
    close() {
        this.modal.closeDlg();
    }

}
