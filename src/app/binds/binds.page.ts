import {
    Component,
    ElementRef,
    AfterViewInit,
    viewChild,
    inject,
    signal,
    ChangeDetectionStrategy
} from '@angular/core';

import {
    DialogRef,
    DIALOG_DATA
} from '@angular/cdk/dialog';

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
    host: {
        '[attr.id]': 'hostID',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditBinds implements AfterViewInit {

    hostID = 'binds-dlg';

    maxNameLen = 16;

    m_src_sel = signal('0');
    m_bind_name= signal('');
    m_dst_sel = signal('0');

    allBindSrc = signal<gIF.hostedBind_t[]>([]);
    freeBindDst = signal<gIF.bind_t[]>([]);
    allBindDst: gIF.bind_t[] = [];

    srcValid = false;

    selSrc = {} as gIF.hostedBind_t;
    selDst = {} as gIF.bind_t;

    bindSrcDesc = signal<gIF.descVal_t[]>([]);
    bindDstDesc = signal<gIF.descVal_t[]>([]);

    storage = inject(StorageService);
    utils = inject(UtilsService);
    dialogRef = inject(DialogRef);
    dlgData = inject(DIALOG_DATA);

    constructor() {
        // ---
    }

    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
     ngAfterViewInit(){

        const attribs: gIF.hostedAttr_t[] = [...this.storage.attrMap().values()] ;
        const all_bind_src: gIF.hostedBind_t[] = [...this.storage.bindsMap.values()];

        if(all_bind_src.length){
            this.allBindSrc.set(all_bind_src);
            this.srcValid = true;
        }
        else {
            this.allBindSrc.set([
                gConst.invalidHostedBind
            ]);
            this.srcValid = false;
        }

        this.allBindDst = [];
        for(const attr of attribs) {
            if(attr.clusterServer){
                const bind = {} as gIF.bind_t;
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
        this.bindSrcSelect('0');
    }

    /***********************************************************************************************
     * fn          bindSrcSelect
     *
     * brief
     *
     */
    bindSrcSelect(idx: string){

        this.m_src_sel.set(idx);

        const i = parseInt(idx);
        this.selSrc = this.allBindSrc()[i];
        this.m_bind_name.set(this.selSrc.name);
        this.setBindSrcDesc(this.selSrc);

        this.setBind(this.selSrc);
    }

    /***********************************************************************************************
     * fn          setBind
     *
     * brief
     *
     */
    setBind(selSrc: gIF.hostedBind_t){

        const free_dst = [];
        free_dst.push(gConst.invalidBind);
        for(let i = 0; i < this.allBindDst.length; i++){
            if(this.allBindDst[i].clusterID === selSrc.clusterID){
                free_dst.push(this.allBindDst[i]);
            }
        }
        this.freeBindDst.set(free_dst);

        this.selDst = free_dst[0];
        let dstIdx = 0;

        if(selSrc.dstExtAddr > 0){
            const len = free_dst.length;
            for(let i = 0; i < len; i++){
                if(free_dst[i].extAddr == selSrc.dstExtAddr){
                    if(free_dst[i].endPoint == selSrc.dstEP){
                        this.selDst = free_dst[i];
                        dstIdx = i;
                        break;
                    }
                }
            }
        }

        this.m_dst_sel.set(`${dstIdx}`);
        this.setBindDstDesc(this.selDst);
    }

    /***********************************************************************************************
     * @fn          onNameChange
     *
     * @brief
     *
     */
    onNameChange(newName: string){

        this.m_bind_name.set(newName);
    }

    /***********************************************************************************************
     * @fn          onNameBlur
     *
     * @brief
     *
     */
    onNameBlur(){

        if(this.m_bind_name() == this.selSrc.name){
            return;
        }
        if(this.m_bind_name() == ''){
            this.m_bind_name.set(this.selSrc.name);
            return;
        }
        const nameLen = this.m_bind_name().length;
        if(nameLen > this.maxNameLen){
            this.m_bind_name.set(this.selSrc.name);
            return;
        }
        this.selSrc.name = this.m_bind_name();

        this.allBindSrc.update((binds)=>{
            return [...binds];
        });
    }

    /***********************************************************************************************
     * fn          bindDstSelect
     *
     * brief
     *
     */
    bindDstSelect(idx: string){

        this.m_dst_sel.set(idx);

        const i = parseInt(idx);
        this.selDst = this.freeBindDst()[i];

        this.setBindDstDesc(this.selDst);
    }

    /***********************************************************************************************
     * fn          setBindSrcDesc
     *
     * brief
     *
     */
    public setBindSrcDesc(srcBind: gIF.hostedBind_t){

        const bind_desc = [];
        let partDesc: gIF.part_t = this.dlgData.partsMap.get(srcBind.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'node:';
            descVal.value = partDesc.devName;
            bind_desc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            bind_desc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 's/n:';
            descVal.value = this.utils.extToHex(this.selSrc.extAddr);
            bind_desc.push(descVal);

            this.bindSrcDesc.set(bind_desc);
        }
        else {
            this.bindSrcDesc.set(gConst.dummyDesc);
        }
    }

    /***********************************************************************************************
     * fn          setBindDstDesc
     *
     * brief
     *
     */
     public setBindDstDesc(bind: gIF.bind_t){

        const bind_desc = [];
        let partDesc: gIF.part_t = this.dlgData.partsMap.get(bind.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'node:';
            descVal.value = partDesc.devName;
            bind_desc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            bind_desc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 's/n:';
            descVal.value = this.utils.extToHex(this.selDst.extAddr);
            bind_desc.push(descVal);

            this.bindDstDesc.set(bind_desc);
        }
        else {
            this.bindDstDesc.set(gConst.dummyDesc);
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

            this.storage.wrBind.set({...this.selSrc});
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
        this.dialogRef.close();
    }

}
