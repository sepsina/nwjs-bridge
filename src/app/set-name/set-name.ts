import {
    Component,
    OnInit,
    AfterViewInit,
    NgZone,
    OnDestroy,
    ViewChild,
    ElementRef
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { StorageService } from '../services/storage.service';
import { EventsService } from '../services/events.service';

import * as gConst from '../gConst';
import * as gIF from '../gIF'

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';


@Component({
    selector: 'app-name',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './set-name.html',
    styleUrls: ['./set-name.scss'],
})
export class SetName implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('attrName') attrName!: ElementRef;

    name = '';
    minNameLen = 3;
    maxNameLen = 16;

    dlgData = {} as gIF.nameDlgData_t;
    dlgReturn = {} as gIF.nameDlgReturn_t;

    constructor(public events: EventsService,
                public modal: ModalService,
                public ngZone: NgZone,
                public storage: StorageService) {
        this.dlgData = this.modal.dlgData as gIF.nameDlgData_t;
        this.name = this.dlgData.name;
    }

    ngOnDestroy(): void {
        // ---
    }

    ngAfterViewInit(): void {
        setTimeout(()=>{
            this.attrName.nativeElement.focus();
            this.attrName.nativeElement.select();
        }, 0);
    }

    ngOnInit() {
        // ---
    }

    /***********************************************************************************************
     * @fn          save
     *
     * @brief
     *
     */
    save() {

        this.dlgReturn.status = 0;
        this.dlgReturn.name = this.name;
        this.events.publish('nameDlgEvt', JSON.stringify(this.dlgReturn));

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
     * @fn          onNameChange
     *
     * @brief
     *
     */
    onNameChange(newVal: string){
        console.log(`new val: ${newVal}`);
        this.name = newVal;
    }

    /***********************************************************************************************
     * @fn          isValid
     *
     * @brief
     *
     */
    isValid(){

        const len = this.name.length;

        if(len < this.minNameLen){
            return false;
        }
        if(len > this.maxNameLen){
            return false;
        }

        return true;
    }

}
