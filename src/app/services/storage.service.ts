import { Injectable, effect, signal } from '@angular/core';

//import * as gConst from './gConst';
import * as gIF from '../gIF';
import * as gConst from '../gConst';

const ATTR = 'attr';
const BIND = 'bind';
const THERMOSTAT = 'thermostat';

@Injectable({
    providedIn: 'root',
})
export class StorageService {

    scrolls = signal<gIF.scroll_t[]>([
        gConst.dumyScroll
    ]);

    attrMap = signal(new Map());
    bindsMap = new Map();

    nvAttrMap = new Map();
    nvBindsMap = new Map();

    attrSet = signal({} as gIF.attrSet_t);
    zclCmd = signal({} as gIF.udpZclReq_t);
    zclRsp = signal({} as gIF.udpZclRsp_t);
    wrBind = signal({} as gIF.hostedBind_t);

    chartData = signal({} as gIF.hostedAttr_t);
    tempEvent = signal({} as gIF.tempEvent_t);

    nvThermostatsMap = new Map();

    txBuf = new Uint8Array(1024);
    rwBuf = new gIF.rwBuf_t();

    constructor() {
        setTimeout(()=>{
            this.init();
        }, 100);
        this.rwBuf.wrBuf = new DataView(this.txBuf.buffer);
    }

    async init() {
        //localStorage.clear();
    }

    /***********************************************************************************************
     * fn          readAllKeys
     *
     * brief
     *
     */
    readAllKeys() {

        for(let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if(key){
                const val = JSON.parse(localStorage.getItem(key)!);
                if(key.slice(0, ATTR.length) == ATTR) {
                    this.nvAttrMap.set(key, val);
                }
                if(key.slice(0, BIND.length) == BIND) {
                    this.nvBindsMap.set(key, val);
                }
                if(key.slice(0, THERMOSTAT.length) == THERMOSTAT) {
                    this.nvThermostatsMap.set(key, val);
                }
            }
        }
    }

    /***********************************************************************************************
     * fn          setAttrName
     *
     * brief
     *
     */
    setAttrName(name: string, keyVal: gIF.keyVal_t) {

        const key = keyVal.key;
        const attr = keyVal.value;
        let nvAttr = {} as gIF.nvAttr_t;

        nvAttr.attrName = name;
        nvAttr.pos = attr.pos;
        nvAttr.style = attr.style;
        nvAttr.valCorr = attr.valCorr;

        localStorage.setItem(key, JSON.stringify(nvAttr));
        attr.name = name;
        this.nvAttrMap.set(key, nvAttr);
    }

    /***********************************************************************************************
     * fn          setAttrStyle
     *
     * brief
     *
     */
    setAttrStyle(style: gIF.ngStyle_t, keyVal: gIF.keyVal_t) {

        const key = keyVal.key;
        const attr = keyVal.value;
        let nvAttr = {} as gIF.nvAttr_t;

        nvAttr.attrName = attr.name;
        nvAttr.pos = attr.pos;
        nvAttr.style = style;
        nvAttr.valCorr = attr.valCorr;

        localStorage.setItem(key, JSON.stringify(nvAttr));
        attr.style = style;
        this.nvAttrMap.set(key, nvAttr);
    }

    /***********************************************************************************************
     * fn          setAttrCorr
     *
     * brief
     *
     */
    setAttrCorr(valCorr: gIF.valCorr_t, keyVal: gIF.keyVal_t) {

        const key = keyVal.key;
        const attr: gIF.hostedAttr_t = keyVal.value;
        let nvAttr = {} as gIF.nvAttr_t;

        nvAttr.attrName = attr.name;
        nvAttr.pos = attr.pos;
        nvAttr.style = attr.style;
        nvAttr.valCorr = valCorr;

        localStorage.setItem(key, JSON.stringify(nvAttr));
        attr.valCorr = valCorr;
        this.nvAttrMap.set(key, nvAttr);
    }

    /***********************************************************************************************
     * fn          setAttrPos
     *
     * brief
     *
     */
    setAttrPos(pos: gIF.nsPos_t, keyVal: gIF.keyVal_t) {

        const key = keyVal.key;
        const attr = keyVal.value;
        let nvAttr = {} as gIF.nvAttr_t;

        nvAttr.attrName = attr.name;
        nvAttr.pos = pos;
        nvAttr.style = attr.style;
        nvAttr.valCorr = attr.valCorr;

        localStorage.setItem(key, JSON.stringify(nvAttr));

        attr.pos = pos;
        this.attrMap.update((map)=>{
            return new Map(map);
        });
    }

    /***********************************************************************************************
     * fn          delStoredAttr
     *
     * brief
     *
     */
    delStoredAttr(attr: gIF.hostedAttr_t) {

        const key = this.attrKey(attr);

        localStorage.removeItem(key);

        this.attrMap.update((map)=>{
            map.delete(key);
            return new Map(map);
        });

        this.nvAttrMap.delete(key);
    }

    /***********************************************************************************************
     * fn          attrKey
     *
     * brief
     *
     */
    attrKey(params: any) {

        this.rwBuf.wrIdx = 0;

        this.rwBuf.write_uint64_LE(params.extAddr);
        this.rwBuf.write_uint8(params.endPoint);
        this.rwBuf.write_uint16_LE(params.clusterID);
        this.rwBuf.write_uint16_LE(params.attrSetID);
        this.rwBuf.write_uint16_LE(params.attrID);
        const len = this.rwBuf.wrIdx;
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = this.txBuf[i].toString(16);
        }
        return `${ATTR}-${key.join('')}`;
    }

    /***********************************************************************************************
     * fn          setBindName
     *
     * brief
     *
     */
    setBindName(bind: gIF.hostedBind_t) {

        const key = this.bindKey(bind);
        const val: gIF.hostedBind_t = this.bindsMap.get(key);
        if(val) {
            let nvBind = {} as gIF.nvBind_t;
            nvBind.bindName = bind.name;
            localStorage.setItem(key, JSON.stringify(nvBind));
            val.name = bind.name;
            this.nvBindsMap.set(key, nvBind);
        }
    }

    /***********************************************************************************************
     * fn          delStoredBinds
     *
     * brief
     *
     */
    delStoredBind(binds: gIF.hostedBind_t) {

        const key = this.bindKey(binds);

        localStorage.removeItem(key);

        this.bindsMap.delete(key);
        this.nvBindsMap.delete(key);
    }

    /***********************************************************************************************
     * fn          bindsKey
     *
     * brief
     *
     */
    bindKey(bind: gIF.hostedBind_t) {

        this.rwBuf.wrIdx = 0;

        this.rwBuf.write_uint64_LE(bind.extAddr);
        this.rwBuf.write_uint8(bind.srcEP);
        this.rwBuf.write_uint16_LE(bind.clusterID);
        const len = this.rwBuf.wrIdx;
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = this.txBuf[i].toString(16);
        }
        return `${BIND}-${key.join('')}`;
    }

    /***********************************************************************************************
     * fn          setScrolls
     *
     * brief
     *
     */
    setScrolls(scrolls: gIF.scroll_t[]) {
        localStorage.setItem('scrolls', JSON.stringify(scrolls));
    }
    /***********************************************************************************************
     * fn          getScrolls
     *
     * brief
     *
     */
    getScrolls(): string {
        return (localStorage.getItem('scrolls') || '');
    }

    /***********************************************************************************************
     * fn          thermostatKey
     *
     * brief
     *
     */
    thermostatKey(extAddr: number, endPoint: number) {

        this.rwBuf.wrIdx = 0;

        this.rwBuf.write_uint64_LE(extAddr);
        this.rwBuf.write_uint8(endPoint);
        const len = this.rwBuf.wrIdx;
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = this.txBuf[i].toString(16);
        }
        return `${THERMOSTAT}-${key.join('')}`;
    }

    /***********************************************************************************************
     * fn          delThermostat
     *
     * brief
     *
     */
    delThermostat(thermostat: gIF.thermostat_t) {

        const key = this.thermostatKey(thermostat.extAddr, thermostat.endPoint);
        localStorage.removeItem(key);

        return key;
    }

    /***********************************************************************************************
     * fn          delAllThermostat
     *
     * brief
     *
     */
    delAllThermostat() {

        for(const key of this.nvThermostatsMap.keys()){
            localStorage.removeItem(key);
        }
        this.nvThermostatsMap.clear();
    }

    /***********************************************************************************************
     * fn          storeThermostat
     *
     * brief
     *
     */
    storeThermostat(thermostat: gIF.thermostat_t) {

        const key = this.thermostatKey(thermostat.extAddr, thermostat.endPoint);
        localStorage.setItem(key, JSON.stringify(thermostat));

        this.nvThermostatsMap.set(key, thermostat);
    }

}
