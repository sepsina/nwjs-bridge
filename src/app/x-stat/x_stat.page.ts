import {
    Component,
    AfterViewInit,
    ElementRef,
    ViewChild,
    HostBinding
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
    selector: 'app-stats',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './x_stat.page.html',
    styleUrls: ['./x_stat.page.scss'],
})
export class EditStats implements AfterViewInit {

    @ViewChild('statSel') statSelRef!: ElementRef;
    @ViewChild('setPoint') setPointRef!: ElementRef;
    @ViewChild('usedSel') usedSelRef!: ElementRef;
    @ViewChild('freeSel') freeSelRef!: ElementRef;

    @HostBinding('attr.id') hostID = 'x-stat-dlg';

    minSetPoint = 5
    maxSetPoint = 50;

    thermostatDesc: gIF.descVal_t[] = [];
    usedDesc: gIF.descVal_t[] = [];
    freeDesc: gIF.descVal_t[] = [];

    selThermostat = {} as gIF.thermostat_t;
    thermostats: gIF.thermostat_t[] = [];

    on_off_all: gIF.on_off_actuator_t[] = [];
    on_off_used: gIF.on_off_actuator_t[] = [];
    on_off_free: gIF.on_off_actuator_t[] = [];

    selUsed = {} as gIF.on_off_actuator_t;
    selFree = {} as gIF.on_off_actuator_t;

    statIdx = 0;
    usedIdx = 0;
    freeIdx = 0;

    validStat = true;

    constructor(
        private modal: ModalService,
        private events: EventsService,
        private storage: StorageService,
        private utils: UtilsService
    ) {
        // ---
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
        }, 0);
    }

    /***********************************************************************************************
     * fn          init
     *
     * brief
     *
     */
    init() {

        let attribs: gIF.hostedAttr_t[] = JSON.parse(JSON.stringify(Array.from(this.storage.attrMap.values())));

        this.thermostats = [];
        this.on_off_all = [];
        this.on_off_used = [];
        this.on_off_free = [];

        for(const attr of attribs){
            if(attr.clusterID === gConst.CLUSTER_ID_MS_TEMPERATURE_MEASUREMENT){
                let thermostat = {} as gIF.thermostat_t;
                thermostat.name = attr.name;
                thermostat.partNum = attr.partNum;
                thermostat.extAddr = attr.extAddr;
                thermostat.shortAddr = attr.shortAddr;
                thermostat.endPoint = attr.endPoint;
                thermostat.hysteresis = gConst.THERMOSTAT_HYSTERESIS;
                thermostat.actuators = [];
                const key = this.storage.thermostatKey(attr.extAddr, attr.endPoint);
                const nvThermostat: gIF.thermostat_t = this.storage.nvThermostatsMap.get(key);
                if(nvThermostat){
                    thermostat.setPoint = nvThermostat.setPoint;
                    thermostat.prevSetPoint = nvThermostat.prevSetPoint;
                    thermostat.workPoint = nvThermostat.workPoint;
                    thermostat.actuators = [...nvThermostat.actuators];
                }
                else {
                    thermostat.setPoint = 20.0;
                    thermostat.prevSetPoint = 0;
                    thermostat.workPoint = 20.0;
                    thermostat.actuators = [];
                }
                this.thermostats.push(thermostat);
            }
            if(attr.clusterServer){
                if(attr.clusterID === gConst.CLUSTER_ID_GEN_ON_OFF){
                    let on_off_actuator = {} as gIF.on_off_actuator_t;
                    on_off_actuator.valid = true;
                    on_off_actuator.name = attr.name;
                    on_off_actuator.partNum = attr.partNum;
                    on_off_actuator.extAddr = attr.extAddr;
                    on_off_actuator.shortAddr = attr.shortAddr;
                    on_off_actuator.endPoint = attr.endPoint;
                    this.on_off_all.push(on_off_actuator);
                }
            }
        }
        this.storage.delAllThermostat();
        for(const thermostat of this.thermostats){
            this.storage.storeThermostat(thermostat);
        }
        if(this.thermostats.length == 0){
            this.validStat = false;
            this.thermostats.push(gConst.invalidStat);
            this.on_off_all = [];
            this.on_off_used = [];
            this.on_off_free = [];
        }
        this.selThermostat = this.thermostats[0];
        this.statIdx = 0;
        setTimeout(()=>{
            this.statSelRef.nativeElement = `${this.statIdx}`;
        }, 0);
        this.setPointRef.nativeElement.value = `${this.selThermostat.setPoint}`;
        this.setThermostatDesc(this.selThermostat);
        this.setThermostat(this.selThermostat);
    }

    /***********************************************************************************************
     * fn          setActuators
     *
     * brief
     *
     */
    setActuators(){

        if(this.on_off_used.length == 0){
            this.on_off_used.push(gConst.dummyOnOff);
        }
        if(this.on_off_free.length == 0){
            this.on_off_free.push(gConst.dummyOnOff);
        }
        this.setUsed(0);
        this.setFree(0);
    }

    /***********************************************************************************************
     * fn          setThermostat
     *
     * brief
     *
     */
    setThermostat(thermostat: gIF.thermostat_t){

        let used_actuators: gIF.on_off_actuator_t[] = [];
        let free_actuators: gIF.on_off_actuator_t[] = [...this.on_off_all];

        for(const actuator of thermostat.actuators){
            let idx = free_actuators.length;
            while(idx--){
                if(free_actuators[idx].extAddr === actuator.extAddr){
                    if(free_actuators[idx].endPoint === actuator.endPoint){
                        const used = free_actuators.splice(idx, 1)[0];
                        used_actuators.push(used);
                    }
                }
            }
        }
        this.on_off_used = used_actuators;
        this.on_off_free = free_actuators;

        this.setActuators();
        if(this.validStat == true){
            this.saveActuators(thermostat, used_actuators);
        }
    }

    /***********************************************************************************************
     * fn          statSelected
     *
     * brief
     *
     */
    statSelected(idx: string){

        const i = parseInt(idx);

        this.statIdx = i;
        this.selThermostat = this.thermostats[i];
        this.setPointRef.nativeElement.value = `${this.selThermostat.setPoint}`;

        this.setThermostatDesc(this.selThermostat);
        this.setThermostat(this.selThermostat);
    }

    /***********************************************************************************************
     * fn          onFreeSelect
     *
     * brief
     *
     */
    onUsedSelect(idx: string){

        const i = parseInt(idx);

        this.usedIdx = i;
        this.selUsed = this.on_off_used[i];
        this.setUsedDesc(this.selUsed);
    }

    /***********************************************************************************************
     * fn          usedSelected
     *
     * brief
     *
     */
    setUsed(idx: number){

        this.usedIdx = idx;
        this.selUsed = this.on_off_used[idx];
        this.setUsedDesc(this.selUsed);
        setTimeout(()=>{
            this.usedSelRef.nativeElement.value = `${idx}`;
        }, 0);
    }

    /***********************************************************************************************
     * fn          onFreeSelect
     *
     * brief
     *
     */
    onFreeSelect(idx: string){

        const i = parseInt(idx);

        this.freeIdx = i;
        this.selFree = this.on_off_free[i];
        this.setFreeDesc(this.selFree);
    }

    /***********************************************************************************************
     * fn          freeSelected
     *
     * brief
     *
     */
    setFree(idx: number){

        this.freeIdx = idx;
        this.selFree = this.on_off_free[idx];
        this.setFreeDesc(this.selFree);
        setTimeout(()=>{
            this.freeSelRef.nativeElement.value = `${idx}`;
        }, 0);
    }

    /***********************************************************************************************
     * fn          setThermostatDesc
     *
     * brief
     *
     */
    setThermostatDesc(thermostat: gIF.thermostat_t){

        this.thermostatDesc = [];
        let partDesc: gIF.part_t = this.modal.dlgData.partsMap.get(thermostat.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'node:';
            descVal.value = partDesc.devName;
            this.thermostatDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            this.thermostatDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 's/n:';
            descVal.value = this.utils.extToHex(thermostat.extAddr);
            this.thermostatDesc.push(descVal);
        }
        else {
            this.thermostatDesc = gConst.dummyDesc;
        }
    }

    /***********************************************************************************************
     * fn          setUsedDesc
     *
     * brief
     *
     */
    setUsedDesc(onOff: gIF.on_off_actuator_t){

        this.usedDesc = [];
        let partDesc: gIF.part_t = this.modal.dlgData.partsMap.get(onOff.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'node:';
            descVal.value = partDesc.devName;
            this.usedDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            this.usedDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 's/n:';
            descVal.value = this.utils.extToHex(onOff.extAddr);
            this.usedDesc.push(descVal);
        }
        else {
            this.usedDesc = gConst.dummyDesc;
        }
    }

    /***********************************************************************************************
     * fn          setFreeDesc
     *
     * brief
     *
     */
    setFreeDesc(onOff: gIF.on_off_actuator_t){

        this.freeDesc = [];
        let partDesc: gIF.part_t = this.modal.dlgData.partsMap.get(onOff.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'node:';
            descVal.value = partDesc.devName;
            this.freeDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            this.freeDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 's/n:';
            descVal.value = this.utils.extToHex(onOff.extAddr);
            this.freeDesc.push(descVal);
        }
        else {
            this.freeDesc = gConst.dummyDesc;
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

    /***********************************************************************************************
     * @fn          saveActuators
     *
     * @brief
     *
     */
    saveActuators(thermostat: gIF.thermostat_t, actuators: gIF.on_off_actuator_t[]) {

        thermostat.actuators = [];
        if(this.on_off_used[0].valid == true){
            for(const on_off of actuators){
                const actuator = {} as gIF.thermostatActuator_t;
                actuator.name = on_off.name;
                actuator.extAddr = on_off.extAddr;
                actuator.endPoint = on_off.endPoint;
                thermostat.actuators.push(actuator);
            }
        }
        this.storage.storeThermostat(thermostat);
    }

    /***********************************************************************************************
     * fn          onSetPointChange
     *
     * brief
     *
     */
    onSetPointChange(newVal: string){

        let set_point = parseInt(newVal, 10);

        if(Number.isNaN(set_point) || (set_point < this.minSetPoint)){
            return;
        }
        if(set_point > this.maxSetPoint){
            set_point = this.maxSetPoint;
        }
        console.log(`new set point: ${set_point}`);
        this.selThermostat.setPoint = set_point;
        this.storage.storeThermostat(this.selThermostat);
        this.setPointRef.nativeElement.value = `${set_point}`;
    }

    /***********************************************************************************************
     * fn          onSetPointBlur
     *
     * brief
     *
     */
    onSetPointBlur(newVal: string){

        let set_point = parseInt(newVal);

        if(Number.isNaN(set_point) || (set_point < this.minSetPoint)){
            this.setPointRef.nativeElement.value = `${this.selThermostat.setPoint}`;
        }
    }

    /***********************************************************************************************
     * fn          addActuator
     *
     * brief
     *
     */
    addActuator(){

        if(this.on_off_free[0].valid == true){
            const idx = this.freeIdx;
            const act: gIF.on_off_actuator_t = this.on_off_free.splice(idx, 1)[0];

            if(this.on_off_free.length == 0){
                this.on_off_free.push(gConst.dummyOnOff);
            }
            this.setFree(0);

            if(this.on_off_used[0].valid == false){
                this.on_off_used = [];
            }
            this.on_off_used.push(act);

            const lastIdx = this.on_off_used.length - 1;
            this.setUsed(lastIdx);

            this.saveActuators(this.selThermostat, this.on_off_used);
        }
    }

    /***********************************************************************************************
     * fn          addActuator
     *
     * brief
     *
     */
    delActuator(){

        if(this.on_off_used[0].valid == true){
            const idx = this.usedIdx;
            const act: gIF.on_off_actuator_t = this.on_off_used.splice(idx, 1)[0];

            if(this.on_off_used.length == 0){
                this.on_off_used.push(gConst.dummyOnOff);
            }
            this.setUsed(0);

            if(this.on_off_free[0].valid == false){
                this.on_off_free = [];
            }
            this.on_off_free.push(act);
            const lastIdx = this.on_off_free.length - 1;
            this.setFree(lastIdx);

            this.saveActuators(this.selThermostat, this.on_off_used);
        }
    }
}
