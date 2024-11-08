import { Injectable, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { UtilsService } from './utils.service';
import { Globals } from './globals';
import * as gConst from '../gConst';
import * as gIF from '../gIF';

@Injectable({
    providedIn: 'root',
})
export class SerialLinkService  {

    rxBuf = new Uint8Array(1024);
    txBuf = new Uint8Array(1024);
    rwBuf = new gIF.rwBuf_t();

    storage = inject(StorageService);
    utils = inject(UtilsService);
    globs = inject(Globals);

    constructor() {
        this.rwBuf.wrBuf = new DataView(this.txBuf.buffer);
    }

    /***********************************************************************************************
     * fn          initApp
     *
     * brief
     *
     */
    initApp() {

        this.storage.readAllKeys();

        setTimeout(()=>{
            this.cleanAgedAttribs();
        }, 60000);
        setTimeout(()=>{
            this.cleanAgedBinds();
        }, 60000);
        setTimeout(()=>{
            this.cleanAgedSets();
        }, 60000);

        // TEST
        /*
        setTimeout(()=>{
            this.test();
        }, 1000);
        */
        // TEST
    }

    /***********************************************************************************************
     * fn          parseAttrSet
     *
     * brief
     *
     */
    parseAttrSet(attrSet: gIF.attrSet_t) {

        const now = Math.round(Date.now() / 1000);
        const attrSpec = this.getAttrSpec(attrSet);
        for(let i = 0; i < attrSpec.length; i++) {
            const spec = attrSpec[i];
            if(spec.isVisible == true) {
                const newVal = {} as gIF.hostedAttr_t;
                newVal.extAddr = attrSet.extAddr;
                newVal.endPoint = attrSet.endPoint;
                newVal.clusterID = attrSet.clusterID;
                newVal.attrSetID = attrSet.attrSetID;
                newVal.attrID = spec.attrID;
                const key = this.storage.attrKey(newVal);
                const currVal: gIF.hostedAttr_t = this.storage.attrMap().get(key);
                if(currVal) {
                    currVal.timestamp = spec.timestamp;
                    currVal.hostShortAddr = attrSet.hostShortAddr;
                    currVal.partNum = attrSet.partNum;
                    currVal.clusterServer = attrSet.clusterServer;
                    currVal.shortAddr = attrSet.shortAddr;
                    currVal.isValid = true;
                    currVal.formatedVal = spec.formatedVal;
                    if(spec.hasHistory) {
                        this.dataHistory(spec.timestamp,
                                         spec.attrVal,
                                         currVal);
                    }
                    this.storage.attrMap.update((map)=>{
                        //map.set(key, currVal);
                        return new Map(map);
                    });
                } else {
                    newVal.drag = false;
                    newVal.isSel = false;
                    newVal.timestamp = now;
                    const storedAttr = this.storage.nvAttrMap.get(key);
                    if(storedAttr) {
                        newVal.pos = storedAttr.pos;
                        newVal.name = storedAttr.attrName;
                        newVal.style = storedAttr.style;
                        newVal.valCorr = storedAttr.valCorr;
                    }
                    else {
                        newVal.pos = {x: 0, y: 0};
                        newVal.name = 'no name';
                        newVal.style = gConst.NG_STYLE;
                        newVal.valCorr = {units: spec.units,
                                          offset: 0};
                    }
                    newVal.hostShortAddr = attrSet.hostShortAddr;
                    newVal.partNum = attrSet.partNum;
                    newVal.clusterServer = attrSet.clusterServer;
                    newVal.shortAddr = attrSet.shortAddr;
                    newVal.isValid = true;
                    newVal.isSensor = spec.isSensor;
                    newVal.formatedVal = spec.formatedVal;
                    newVal.timestamps = [];
                    newVal.attrVals = [];
                    if(spec.hasHistory) {
                        this.dataHistory(now,
                                         spec.attrVal,
                                         newVal);
                    }
                    this.storage.attrMap.update((map)=>{
                        map.set(key, newVal);
                        return new Map(map);
                    });
                }
                console.log(spec.formatedVal);
            }
        }
    }

    /***********************************************************************************************
     * fn          cleanAgedAttribs
     *
     * brief
     *
     */
    private cleanAgedAttribs() {

        let diff: number;
        let now = Math.round(Date.now() / 1000);
        for(let [key, val] of this.storage.attrMap()) {
            diff = now - val.timestamp;
            if(diff > gConst.ATTR_TTL) {
                this.storage.attrMap.update((map)=>{
                    map.delete(key);
                    return new Map(map);
                });
            }
            if(diff > gConst.ATTR_VALID_TTL) {
                val.isValid = false;
            }
        }
        setTimeout(()=>{
            this.cleanAgedAttribs();
        }, 60000); // 60 seconds
    }

    /***********************************************************************************************
     * fn          addSrcBinds
     *
     * brief
     *
     */
    addBind(bind: gIF.clusterBind_t) {

        const now = Math.round(Date.now() / 1000);
        const newVal = {} as gIF.hostedBind_t;
        newVal.extAddr = bind.extAddr;
        newVal.srcEP = bind.srcEP;
        newVal.clusterID = bind.clusterID;
        const key = this.storage.bindKey(newVal);
        const currVal = this.storage.bindsMap.get(key);
        if(currVal) {
            currVal.timestamp = now;
            currVal.partNum = bind.partNum;
            currVal.hostShortAddr = bind.hostShortAddr;
            currVal.srcShortAddr = bind.srcShortAddr;
            currVal.dstExtAddr = bind.dstExtAddr;
            currVal.dstEP = bind.dstEP;
        }
        else {
            newVal.timestamp = now;
            const storedBind = this.storage.nvBindsMap.get(key);
            if(storedBind) {
                newVal.name = storedBind.bindName;
            }
            else {
                newVal.name = 'no name';
            }
            newVal.partNum = bind.partNum;
            newVal.hostShortAddr = bind.hostShortAddr;
            newVal.srcShortAddr = bind.srcShortAddr;
            newVal.dstEP = bind.dstEP;
            newVal.dstExtAddr = bind.dstExtAddr;

            this.storage.bindsMap.set(key, newVal);
        }
        let msg = '';
        msg += `rx bind -> hostShortAddr: 0x${bind.hostShortAddr.toString(16).padStart(4, '0').toUpperCase()},`;
        msg += ` srcAddr: 0x${bind.srcShortAddr.toString(16).padStart(4, '0').toUpperCase()},`;
        msg += ` srcEP: ${bind.srcEP},`;
        msg += ` cluster: 0x${bind.clusterID.toString(16).padStart(4, '0').toUpperCase()},`;
        msg += ` dstExtAddr: ${this.utils.extToHex(bind.dstExtAddr)},`;
        msg += ` dstEP: ${bind.dstEP}`;
        console.log(msg);
    }

    /***********************************************************************************************
     * fn          cleanAgedBinds
     *
     * brief
     *
     */
    private cleanAgedBinds() {

        const now = Math.round(Date.now() / 1000);
        for(let [key, val] of this.storage.bindsMap) {
            const diff = now - val.timestamp;
            if(diff > gConst.BIND_TTL) {
                this.storage.bindsMap.delete(key);
            }
        }
        setTimeout(()=>{
            this.cleanAgedBinds();
        }, 60000);
    }

    /***********************************************************************************************
     * fn          getKey
     *
     * brief
     *
     */
    private getKey(attrSet: gIF.attrSet_t, attrID: number) {

        const tmp = {
            extAddr: attrSet.extAddr,
            endPoint: attrSet.endPoint,
            clusterID: attrSet.clusterID,
            attrSetID: attrSet.attrSetID,
            attrID: attrID,
        };

        return this.storage.attrKey(tmp);
    }

    /***********************************************************************************************
     * fn          corrVal
     *
     * brief
     *
     */
    private corrVal(val: number, corr: gIF.valCorr_t) {

        let corrVal = val + corr.offset;

        switch(corr.units) {
            case gConst.DEG_F: {
                corrVal = (corrVal * 9.0) / 5.0 + 32.0;
                break;
            }
        }
        return corrVal;
    }

    /***********************************************************************************************
     * fn          dataHistory
     *
     * brief
     *
     */
    private dataHistory(timestamp: number,
                        val: number,
                        attr: gIF.hostedAttr_t) {
        let len = attr.timestamps.length;
        if(len > 0){
            let last = attr.timestamps[len - 1];
            if((timestamp - last) > 59){
                attr.timestamps.push(timestamp);
                attr.attrVals.push(val);
                len++;
                if(len > gConst.HIST_LEN) {
                    attr.timestamps.shift();
                    attr.attrVals.shift();
                }
                this.storage.chartData.set(attr);
            }
        }
        else {
            attr.timestamps.push(timestamp);
            attr.attrVals.push(val);
        }
    }

    /***********************************************************************************************
     * fn          getAttrSpec
     *
     * brief
     *
     */
    private getAttrSpec(attrSet: gIF.attrSet_t): gIF.attrSpec_t[] {

        let attrSpecs: gIF.attrSpec_t[] = [];

        const attr_vals = new Uint8Array(attrSet.attrVals);
        this.rwBuf.rdBuf = new DataView(attr_vals.buffer);
        this.rwBuf.rdIdx = 0;

        let now = Math.round(Date.now() / 1000);
        let setVals = {} as any;
        let key: string;
        let nvAttr: gIF.nvAttr_t;
        let spec: gIF.attrSpec_t;
        let formatedVal = '';
        let attrID: number;
        let attrName = '';
        let units: number;

        switch(attrSet.partNum) {
            case gConst.SI7021_027_RH:
            case gConst.SHT40_018_RH:
            case gConst.HTU21D_005_RH: {
                let rh = this.rwBuf.read_uint16_LE();
                rh /= 10.0;
                let corrRH = rh;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                    corrRH = this.corrVal(rh, nvAttr.valCorr);
                }
                setVals = {
                    name: attrName,
                    rh_val: corrRH,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: `${rh.toFixed(0)} %rh`,
                    units: gConst.RH_UNIT,
                    timestamp: now,
                    attrVal: rh,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.SI7021_027_T:
            case gConst.HTU21D_005_T:
            case gConst.SHT40_018_T: {
                let temp = this.rwBuf.read_int16_LE();
                temp /= 10.0;
                let corrTemp = temp;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                units = gConst.DEG_C;
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                    units = nvAttr.valCorr.units;
                    corrTemp = this.corrVal(temp, nvAttr.valCorr);
                    if(units == gConst.DEG_F) {
                        formatedVal = `${corrTemp.toFixed(1)} °F`;
                    }
                    else {
                        formatedVal = `${corrTemp.toFixed(1)} °C`;
                    }
                }
                else {
                    formatedVal = `${corrTemp.toFixed(1)} °C`;
                }
                setVals = {
                    name: attrName,
                    units: units,
                    t_val: corrTemp,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: formatedVal,
                    units: units,
                    timestamp: now,
                    attrVal: temp,
                };
                attrSpecs.push(spec);

                const tempEvent = {} as gIF.tempEvent_t;
                tempEvent.temp = corrTemp;
                tempEvent.extAddr = attrSet.extAddr;
                tempEvent.endPoint = attrSet.endPoint;

                this.storage.tempEvent.set(tempEvent);
                break;
            }
            case gConst.SH_006_SH: {
                let sh = this.rwBuf.read_uint16_LE();
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    sh_val: sh,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: `${sh.toFixed(0)} %sh`,
                    units: gConst.NO_UNIT,
                    timestamp: now,
                    attrVal: sh,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.SSR_009_RELAY: {
                let state = this.rwBuf.read_uint8();
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    state: state,
                    level: 0xff,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: true,
                    formatedVal: !!state ? 'on' : 'off',
                    units: gConst.NO_UNIT,
                    timestamp: now,
                    attrVal: state,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.ENS_015_AQ: {
                let aq = this.rwBuf.read_uint16_LE();
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    aq: aq
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: `aq - ${aq.toFixed(0)}`,
                    units: gConst.NO_UNIT,
                    timestamp: now,
                    attrVal: aq,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.ACUATOR_010_ON_OFF: {
                let state = this.rwBuf.read_uint8();
                let level = this.rwBuf.read_uint8();
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                formatedVal = 'off';
                if(!!state) {
                    formatedVal = `on (${level}%)`;
                }
                setVals = {
                    name: attrName,
                    state: state,
                    level: level,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: true,
                    formatedVal: formatedVal,
                    units: gConst.NO_UNIT,
                    timestamp: now,
                    attrVal: state,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.HTU21D_005_BAT:
            case gConst.SHT40_018_BAT:
            case gConst.SI7021_027_BAT:
            case gConst.SH_006_BAT:
            case gConst.DBL_SW_008_BAT:
            case gConst.PB_SW_023_BAT:
            case gConst.TGL_SW_011_BAT:
            case gConst.RKR_SW_012_BAT: {
                let batVolt = this.rwBuf.read_uint8();
                batVolt /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    bat_volt: batVolt,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: false,
                    formatedVal: `${batVolt.toFixed(1)} V`,
                    units: gConst.VOLT_UNIT,
                    timestamp: now,
                    attrVal: batVolt,
                };
                attrSpecs.push(spec);
                break;
            }
        }
        let hostedSet = {
            timestamp: now,
            hostShortAddr: attrSet.hostShortAddr,
            partNum: attrSet.partNum,
            extAddr: attrSet.extAddr,
            shortAddr: attrSet.shortAddr,
            endPoint: attrSet.endPoint,
            clusterID: attrSet.clusterID,
            attrSetID: attrSet.attrSetID,
            setVals: setVals,
        };
        key = this.attrSetKey(hostedSet);
        this.globs.setMap.set(key, hostedSet);

        return attrSpecs;
    }

    /***********************************************************************************************
     * fn          attrSetKey
     *
     * brief
     *
     */
    attrSetKey(params: any) {

        const len = 8 + 1 + 2 + 2;
        const ab = new ArrayBuffer(len);
        const dv = new DataView(ab);
        let i = 0;
        dv.setFloat64(i, params.extAddr, gConst.LE);
        i += 8;
        dv.setUint8(i++, params.endPoint);
        dv.setUint16(i, params.clusterID, gConst.LE);
        i += 2;
        dv.setUint16(i, params.attrSetID, gConst.LE);
        i += 2;
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = dv.getUint8(i).toString(16);
        }
        return `set-${key.join('')}`;
    }

    /***********************************************************************************************
     * fn          cleanAgedSets
     *
     * brief
     *
     */
    private cleanAgedSets() {
        let diff: number;
        let now = Math.round(Date.now() / 1000);
        for(let [key, val] of this.globs.setMap) {
            diff = now - val.timestamp;
            if(diff > gConst.SET_TTL) {
                this.globs.setMap.delete(key);
            }
        }
        setTimeout(()=>{
            this.cleanAgedSets();
        }, 60000); // 60 seconds
    }

}
