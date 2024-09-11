import {
    Component,
    ElementRef,
    AfterViewInit,
    HostBinding,
    ViewChild
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { EventsService } from '../services/events.service';
import { StorageService } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import * as gConst from '../gConst';
import * as gIF from '../gIF'



@Component({
    selector: 'app-binds',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './binds.page.html',
    styleUrls: ['./binds.page.scss'],
})
export class EditBinds implements AfterViewInit {

    @ViewChild('bindSrcSel') srcSelRef!: ElementRef;
    @ViewChild('bindName') bindNameRef!: ElementRef;
    @ViewChild('bindDstSel') dstSelRef!: ElementRef;

    @HostBinding('attr.id') hostID = 'binds-dlg';

    bind_name = '';
    maxNameLen = 16;

    allBindSrc: gIF.hostedBind_t[] = [];
    freeBindDst: gIF.bind_t[] = [];
    allBindDst: gIF.bind_t[] = [];

    srcValid = false;

    selSrc = {} as gIF.hostedBind_t;
    selDst = {} as gIF.bind_t;
    srcIdx = 0;
    dstIdx = 0;

    bindSrcDesc: gIF.descVal_t[] = [];
    bindDstDesc: gIF.descVal_t[] = [];

    constructor(
        private modal: ModalService,
        private events: EventsService,
        private storage: StorageService,
        private utils: UtilsService
    ) {
        this.allBindSrc = JSON.parse(JSON.stringify(Array.from(this.storage.bindsMap.values())));
    }

    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
     ngAfterViewInit(){
        setTimeout(() => {
            this.init();
        }, 10);
    }

    /***********************************************************************************************
     * @fn          onNameChange
     *
     * @brief
     *
     */
    onNameChange(newName: string){

        console.log(`new val: ${newName}`);

        if(newName == '') {
            return;
        }
        if(newName.length > this.maxNameLen){
            this.bindNameRef.nativeElement.value = this.bind_name;
            return;
        }
        this.bind_name = newName;
    }

    /***********************************************************************************************
     * @fn          onNameBlur
     *
     * @brief
     *
     */
    onNameBlur(newName: string){

        console.log(`name blur: ${newName}`);

        if(newName == '') {
            this.bindNameRef.nativeElement.value = this.bind_name;
        }
    }

    /***********************************************************************************************
     * fn          init
     *
     * brief
     *
     */
    init() {

        let attribs: gIF.hostedAttr_t[] = JSON.parse(JSON.stringify(Array.from(this.storage.attrMap.values())));

        this.allBindDst = [];
        for(const attr of attribs) {
            if(attr.clusterServer){
                let bind = {} as gIF.bind_t;
                bind.valid = true;
                bind.extAddr = attr.extAddr;
                bind.name = attr.name;
                bind.partNum = attr.partNum;
                bind.clusterID = attr.clusterID;
                bind.shortAddr = attr.shortAddr;
                bind.endPoint = attr.endPoint;
                this.allBindDst.push(bind);
            }
        }
        if(this.allBindSrc.length){
            this.srcValid = true;
        }
        else {
            this.allBindSrc.push(gConst.invalidHostedBind);
            this.srcValid = false;
        }
        this.selSrc = this.allBindSrc[0];
        this.srcIdx = 0;
        this.bind_name = this.selSrc.name;
        this.bindNameRef.nativeElement.value = this.selSrc.name;

        this.setBind(this.selSrc);
        this.setBindSrcDesc(this.selSrc);
        setTimeout(()=>{
            this.srcSelRef.nativeElement.value = `${this.srcIdx}`;
        }, 0);
    }

    /***********************************************************************************************
     * fn          setBind
     *
     * brief
     *
     */
    setBind(selSrc: gIF.hostedBind_t){

        let i = 0;

        this.freeBindDst = [];
        this.freeBindDst.push(gConst.invalidBind);
        this.selDst = this.freeBindDst[0];
        this.dstIdx = 0;

        for(i = 0; i < this.allBindDst.length; i++){
            if(this.allBindDst[i].clusterID === selSrc.clusterID){
                this.freeBindDst.push(this.allBindDst[i]);
            }
        }
        this.bindDstDesc = [];
        if(selSrc.dstExtAddr > 0){
            for(i = 0; i < this.freeBindDst.length; i++){
                if(this.freeBindDst[i].extAddr === selSrc.dstExtAddr){
                    if(this.freeBindDst[i].endPoint === selSrc.dstEP){
                        this.selDst = this.freeBindDst[i];
                        this.dstIdx = i;
                        break;
                    }
                }
            }
        }
        this.setBindDstDesc(this.selDst);
        setTimeout(()=>{
            this.dstSelRef.nativeElement.value = `${this.dstIdx}`;
        }, 0);
    }

    /***********************************************************************************************
     * fn          bindSrcSelected
     *
     * brief
     *
     */
    bindSrcSelected(index: string){

        const i = parseInt(index);

        this.selSrc = this.allBindSrc[i];
        this.bind_name = this.selSrc.name;
        this.bindNameRef.nativeElement.value = this.selSrc.name;

        this.setBindSrcDesc(this.selSrc);
        this.setBind(this.selSrc);
    }

    /***********************************************************************************************
     * fn          bindDstSelected
     *
     * brief
     *
     */
    bindDstSelected(index: string){

        const i = parseInt(index);

        this.selDst = this.freeBindDst[i];
        this.setBindDstDesc(this.selDst);
    }

    /***********************************************************************************************
     * fn          setBindSrcDesc
     *
     * brief
     *
     */
    public setBindSrcDesc(srcBind: gIF.hostedBind_t){

        this.bindSrcDesc = [];
        let partDesc: gIF.part_t = this.modal.dlgData.partsMap.get(srcBind.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'node:';
            descVal.value = partDesc.devName;
            this.bindSrcDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            this.bindSrcDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 's/n:';
            descVal.value = this.utils.extToHex(this.selSrc.extAddr);
            this.bindSrcDesc.push(descVal);
        }
        else {
            this.bindSrcDesc = gConst.dummyDesc;
        }
    }

    /***********************************************************************************************
     * fn          setBindDstDesc
     *
     * brief
     *
     */
     public setBindDstDesc(bind: gIF.bind_t){

        this.bindDstDesc = [];
        let partDesc: gIF.part_t = this.modal.dlgData.partsMap.get(bind.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'node:';
            descVal.value = partDesc.devName;
            this.bindDstDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            this.bindDstDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 's/n:';
            descVal.value = this.utils.extToHex(this.selDst.extAddr);
            this.bindDstDesc.push(descVal);
        }
        else {
            this.bindDstDesc = gConst.dummyDesc;
        }
    }

    /***********************************************************************************************
     * fn          wrSrcBinds
     *
     * brief
     *
     */
    public wrSrcBinds(){

        if(this.srcValid){
            if(this.selDst.valid){
                this.selSrc.dstExtAddr = this.selDst.extAddr;
                this.selSrc.dstEP = this.selDst.endPoint;
            }
            else {
                this.selSrc.dstExtAddr = 0;
                this.selSrc.dstEP = 0;
            }
            this.events.publish('wr_bind', this.selSrc);
        }
    }

    /***********************************************************************************************
     * fn          wrBindName
     *
     * brief
     *
     */
    async wrBindName() {
        if(this.srcValid){
            this.selSrc.name = this.bind_name;
            this.storage.setBindName(this.selSrc);
        }
    }

    /***********************************************************************************************
     * fn          close
     *
     * brief
     *
     */
    close() {
        this.modal.closeDlg();
    }

}
