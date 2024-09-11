import {
    Component,
    ViewChild,
    ElementRef,
    AfterViewInit,
    HostBinding,
    OnInit
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { EventsService } from '../services/events.service';
import { StorageService } from '../services/storage.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import * as gConst from '../gConst';
import * as gIF from '../gIF'


@Component({
    selector: 'app-set-corr',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './set-corr.html',
    styleUrls: ['./set-corr.scss'],
})
export class SetCorr implements AfterViewInit, OnInit {

    @ViewChild('unitSel') unitSelRef!: ElementRef;
    @ViewChild('offset') offsetRef!: ElementRef;

    @HostBinding('attr.id') hostID = 'corr-dlg';

    allUnits: any[] = [];
    selUnit: any;
    unitIdx = '';
    prevIdx = 0;
    title = 'unset';


    valCorr = {} as gIF.valCorr_t;
    attr = {} as gIF.hostedAttr_t;

    hasUnits = false;
    unitSel: any[] = [];

    offsetVal = 0;

    constructor(
        private modal: ModalService,
        public events: EventsService,
        public storage: StorageService
    ) {
        this.attr = this.modal.dlgData.keyVal.value;
        this.title = this.attr.name;
    }

    /***********************************************************************************************
     * @fn          ngOnInit
     *
     * @brief
     *
     */
    ngOnInit(): void {

        this.valCorr = JSON.parse(JSON.stringify(this.attr.valCorr));
        this.offsetVal = this.valCorr.offset; // degC

        switch(this.attr.clusterID){
            case gConst.CLUSTER_ID_MS_TEMPERATURE_MEASUREMENT: {
                this.hasUnits = true;
                this.allUnits.push({name: 'degC', units: gConst.DEG_C});
                this.allUnits.push({name: 'degF', units: gConst.DEG_F});
                if(this.attr.valCorr.units == gConst.DEG_F){
                    this.prevIdx = 1;
                    this.unitIdx = '1';
                    this.selUnit = this.allUnits[1];
                    this.offsetVal = this.offsetVal * 9.0 / 5.0; // degC to degF
                }
                if(this.attr.valCorr.units == gConst.DEG_C){
                    this.prevIdx = 0;
                    this.unitIdx = '0';
                    this.selUnit = this.allUnits[0];
                }
                this.offsetVal = Math.round(this.offsetVal * 10) / 10;
                break;
            }
            case gConst.CLUSTER_ID_MS_RH_MEASUREMENT: {
                this.hasUnits = true;
                this.allUnits.push({name: '%', units: gConst.RH_UNIT});

                this.unitIdx = '0';
                this.selUnit = this.allUnits[0];

                this.offsetVal = Math.round(this.offsetVal * 10) / 10;
                break;
            }
        }
    }

    /***********************************************************************************************
     * @fn          ngAfterViewInit
     *
     * @brief
     *
     */
    ngAfterViewInit(): void {

        setTimeout(() => {
            this.offsetRef.nativeElement.value = `${this.offsetVal}`
            this.unitSelRef.nativeElement.value = this.unitIdx;

            this.offsetRef.nativeElement.focus();
            this.offsetRef.nativeElement.select();
        }, 100);
    }

    /***********************************************************************************************
     * @fn          save
     *
     * @brief
     *
     */
    async save() {

        if(this.selUnit.units == gConst.DEG_F){
            this.offsetVal = this.offsetVal * 5.0 / 9.0; // degF to degC
            this.offsetVal = Math.round(this.offsetVal * 10) / 10;
        }

        this.valCorr.units = this.selUnit.units;
        this.valCorr.offset = this.offsetVal;

        console.log(this.valCorr);

        this.storage.setAttrCorr(this.valCorr, this.modal.dlgData.keyVal);
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
     * @fn          unitSelected
     *
     * @brief
     *
     */
    unitSelected(idx: string){

        const i = parseInt(idx);

        this.selUnit = this.allUnits[i];
        const prevUnits = this.allUnits[this.prevIdx];
        this.prevIdx = i;

        if(this.selUnit.units == gConst.DEG_F){
            if(prevUnits.units == gConst.DEG_C){
                this.offsetVal = this.offsetVal * 9.0 / 5.0; // degC to degF
                this.offsetVal = Math.round(this.offsetVal * 10) / 10;
            }
        }
        if(this.selUnit.units == gConst.DEG_C){
            if(prevUnits.units == gConst.DEG_F){
                this.offsetVal = this.offsetVal * 5.0 / 9.0; // degF to degC
                this.offsetVal = Math.round(this.offsetVal * 10) / 10;
            }
        }
        this.offsetRef.nativeElement.value = `${this.offsetVal}`
    }

     /***********************************************************************************************
     * fn          onOffsetChange
     *
     * brief
     *
     */
    onOffsetChange(newVal: string){

        let offset = parseFloat(newVal);

        if(Number.isNaN(offset)){
            return;
        }
        offset = Math.round(offset * 10) / 10;
        this.offsetRef.nativeElement.value = `${offset}`;
        console.log(`new offset: ${offset}`);

        this.offsetVal = offset;
    }

    /***********************************************************************************************
     * fn          onOffsetBlur
     *
     * brief
     *
     */
    onOffsetBlur(newVal: string){

        let offset = parseInt(newVal);

        if(Number.isNaN(offset)){
            this.offsetRef.nativeElement.value = `${this.offsetVal}`;
        }
    }


}
