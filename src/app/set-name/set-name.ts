import {
    Component,
    AfterViewInit,
    ViewChild,
    ElementRef,
    HostBinding
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
export class SetName implements AfterViewInit {

    @ViewChild('attrName') attrNameRef!: ElementRef;
    @HostBinding('attr.id') hostID = 'name-dlg';

    name = '';
    minNameLen = 2;
    maxNameLen = 16;

    title = '';

    dlgData = {} as gIF.nameDlgData_t;
    dlgReturn = {} as gIF.nameDlgReturn_t;

    //selAttr = {} as gIF.keyVal_t;

    constructor(
        public modal: ModalService,
        public events: EventsService,
        public storage: StorageService
    ) {
        //this.selAttr = this.modal.dlgData.keyVal;
        this.name = this.modal.dlgData.keyVal.value.name;
        this.title = this.name;
    }

    /***********************************************************************************************
     * @fn          ngAfterViewInit
     *
     * @brief
     *
     */
    ngAfterViewInit(): void {
        setTimeout(()=>{
            this.attrNameRef.nativeElement.value = this.name;
            this.attrNameRef.nativeElement.focus();
            this.attrNameRef.nativeElement.select();
        }, 0);
    }

    /***********************************************************************************************
     * @fn          save
     *
     * @brief
     *
     */
    save() {
        this.storage.setAttrName(this.name, this.modal.dlgData.keyVal);
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
    onNameChange(newName: string){

        console.log(`new val: ${newName}`);

        const nameLen = newName.length;
        if(newName == '' || nameLen < this.minNameLen) {
            return;
        }
        if(nameLen > this.maxNameLen){
            this.attrNameRef.nativeElement.value = this.name;
            return;
        }
        this.name = newName;
    }

    /***********************************************************************************************
     * @fn          onNameBlur
     *
     * @brief
     *
     */
    onNameBlur(newName: string){

        console.log(`name blur: ${newName}`);

        const nameLen = newName.length;
        if(newName == '' || (nameLen < this.minNameLen)) {
            this.attrNameRef.nativeElement.value = this.name;
        }
    }

}
