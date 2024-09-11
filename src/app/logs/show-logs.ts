import {
    Component,
    OnInit,
    ElementRef,
    ViewChild,
    AfterViewInit,
    HostBinding
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { EventsService } from '../services/events.service';
import { UtilsService } from '../services/utils.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import * as gConst from '../gConst';
import * as gIF from '../gIF'

@Component({
    selector: 'app-show-logs',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './show-logs.html',
    styleUrls: ['./show-logs.scss']
})
export class ShowLogs implements OnInit, AfterViewInit{

    @ViewChild('cbScroll') cbScroll!: ElementRef;
    @ViewChild('logList') logList!: ElementRef;

    @HostBinding('attr.id') hostID = 'logs-dlg';

    constructor(
        private modal: ModalService,
        private events: EventsService,
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

        this.events.subscribe('logMsg', (msg: gIF.msgLogs_t)=>{
            if(this.cbScroll.nativeElement.checked) {
                this.logList.nativeElement.scrollTop = this.logList.nativeElement.scrollHeight;
            }
        });
    }

    /***********************************************************************************************
     * @fn          afterViewInit
     *
     * @brief
     *
     */
    ngAfterViewInit(): void {
        this.cbScroll.nativeElement.checked = false;
    }

    /***********************************************************************************************
     * @fn          save
     *
     * @brief
     *
     */
    save() {
        this.modal.closeDlg();
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

    /***********************************************************************************************
     * fn          autoScroll
     *
     * brief
     *
     */
    autoScrollChange() {

        if(this.cbScroll.nativeElement.checked) {
            this.logList.nativeElement.scrollTop = this.logList.nativeElement.scrollHeight;
        }
    }

    /***********************************************************************************************
     * fn          clearLogs
     *
     * brief
     *
     */
    clearLogs() {
        this.utils.msgLogs = [];
    }

}
