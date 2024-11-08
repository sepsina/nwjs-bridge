
export enum eRxState {
    E_STATE_RX_WAIT_START,
    E_STATE_RX_WAIT_TYPELSB,
    E_STATE_RX_WAIT_TYPEMSB,
    E_STATE_RX_WAIT_LENLSB,
    E_STATE_RX_WAIT_LENMSB,
    E_STATE_RX_WAIT_CRC,
    E_STATE_RX_WAIT_DATA
}

export enum eDlgType {
    E_ATTR_NAME,
    E_ATTR_STYLE,
    E_BINDS,
    E_STATS,
    E_SCROLLS,
    E_LOGS,
    E_UNITS,
    E_SSR,
    E_GRAPH,
    E_ABOUT
}

export enum eDlgStyle{
    E_FONT_SIZE,
}

export interface rdHost_t {
    queue: number[];
    busy: boolean;
    tmoRef: any;
    rdType: string;
    idx: number;
    retryCnt: number;
}

export interface slCmd_t {
    seqNum: number;
    ttl: number;
    cmdID: number;
    hostShortAddr: number;
    ip: string;
    port: number;
}

export interface dataHost_t {
    shortAddr: number;
    extAddr: number;
    numAttrSets: number;
    numSrcBinds: number;
}
export interface attrSet_t {
    hostShortAddr: number;
    partNum: number;
    clusterServer: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    attrMap: number;
    valsLen: number;
    attrVals: number[];
}
export interface attrSpec_t {
    attrID: number;
    isVisible: boolean;
    isSensor: boolean;
    hasHistory: boolean;
    formatedVal: string;
    units: number;
    timestamp: number;
    attrVal: number;
}
export interface nsPos_t {
    x: number;
    y: number;
}
export interface ngStyle_t {
    color: string;
    bgColor: string;
    bgOpacity: number;
    fontSize: number;
    borderWidth: number;
    borderStyle: string;
    borderColor: string;
    borderRadius: number;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}
export interface valCorr_t{
    units: number;
    offset: number;
}

export interface hostedSet_t {
    timestamp: number;
    hostShortAddr: number;
    partNum: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    setVals: any;
}

export interface hostedAttr_t {
    drag: boolean;
    isSel: boolean;
    timestamp: number;
    pos: nsPos_t;
    name: string;
    style: ngStyle_t;
    valCorr: valCorr_t;
    hostShortAddr: number;
    partNum: number;
    clusterServer: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    attrID: number;
    isValid: boolean;
    isSensor:boolean;
    formatedVal: string;
    timestamps: number[];
    attrVals: number[];
}

export interface keyVal_t {
    key: string;
    value: hostedAttr_t;
}

export interface attrKey_t {
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    attrID: number;
}

export interface nvAttr_t {
    attrName: string;
    pos: nsPos_t;
    style: ngStyle_t;
    valCorr: valCorr_t;
}

export interface bindDst_t {
    dstExtAddr: number;
    dstEP: number;
}
export interface hostedBind_t {
    timestamp: number;
    name: string;
    partNum: number;
    hostShortAddr: number;
    extAddr: number;
    srcShortAddr: number;
    srcEP: number;
    clusterID: number;
    dstExtAddr: number;
    dstEP: number;
}
export interface clusterBind_t {
    partNum: number;
    hostShortAddr: number;
    extAddr: number;
    srcShortAddr: number;
    srcEP: number;
    clusterID: number;
    dstExtAddr: number;
    dstEP: number;
}
export interface bind_t {
    valid: boolean;
    partNum: number;
    extAddr: number;
    name: string;
    clusterID: number;
    shortAddr: number;
    endPoint: number;
}

export interface nvBind_t {
    bindName: string;
}

export interface descVal_t {
    key: string;
    value: string
}

export  interface partDesc_t {
    partNum: number;
    devName: string;
    part: string;
    url: string;
}

export  interface part_t {
    devName: string;
    part: string;
    url: string;
}

export interface scroll_t {
    name: string;
    yPos: number;
}

export interface usbId_t {
    pid: number;
    vid: number;
}

export interface udpZclReq_t {
    seqNum: number;
    ip: string;
    port: number;
    extAddr: number;
    endPoint: number;
    clusterID: number;
    hasRsp: number;
    cmdLen: number;
    cmd: number[]
}

export interface udpZclRsp_t {
    seqNum: number;
    ip: string;
    port: number;
    extAddr: number;
    endPoint: number;
    clusterID: number;
    status: number;
}

export interface rinfo_t {
    address: string;
    family: string;
    port: number;
    size: number;
}


export interface dns_t {
    user: string;
    psw: string;
    domain: string;
    token: string;
}

export interface slMsg_t {
    type: number;
    data: number[];
}

export interface hostCmd_t {
    shortAddr: number;
    type: number;
    idx: number;
    retryCnt: number;
    param:string;
}

export interface udpCmd_t {
    seqNum: number;
    ttl: number;
    cmdID: number;
    hostShortAddr: number;
    ip: string;
    port: number;
}

export interface imgDim_t {
    width: number;
    height: number;
}

export interface workerCmd_t {
    type: number;
    cmd: any;
}

export interface thermostatActuator_t {
    name: string;
    extAddr: number;
    endPoint: number;
}

export interface thermostat_t {
    name: string;
    partNum: number;
    extAddr: number;
    setPoint: number;
    prevSetPoint: number;
    workPoint: number;
    hysteresis: number;
    shortAddr: number;
    endPoint: number;
    actuators: thermostatActuator_t[];
}

export interface on_off_actuator_t {
    valid: boolean
    name: string;
    partNum: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
}

export interface tempEvent_t {
    temp: number;
    extAddr: number;
    endPoint: number;
}

export interface slMsg_t {
    type: number;
    data: number[];
}

export interface msgLogs_t {
    text: string;
    color: string;
    id: number;
}

export interface spCmd_t {
    type: number;
    retryCnt: number;
    param:string;
}

export interface rdAtIdxParam_t {
    shortAddr: number;
    idx: number;
}

export interface nameDlgData_t {
    type: eDlgType;
    name: string;
}

export interface nameDlgReturn_t {
    status: number;
    name: string;
}

export interface units_t {
    name: string;
    units: number;
}

export class rwBuf_t {

    rdIdx!: number;
    wrIdx!: number;

    rdBuf!: DataView;
    wrBuf!: DataView;

    constructor(){

    }

    read_uint8(){
        const val = this.rdBuf.getUint8(this.rdIdx);
        this.rdIdx += 1;
        return val;
    }

    read_uint16_LE(){
        const val = this.rdBuf.getUint16(this.rdIdx, true);
        this.rdIdx += 2;
        return val;
    }

    read_int16_LE(){
        const val = this.rdBuf.getInt16(this.rdIdx, true);
        this.rdIdx += 2;
        return val;
    }

    read_uint32_LE(){
        const val = this.rdBuf.getUint32(this.rdIdx, true);
        this.rdIdx += 4;
        return val;
    }

    read_uint64_LE(){
        const val = this.rdBuf.getFloat64(this.rdIdx, true);
        this.rdIdx += 8;
        return val;
    }

    write_uint8(val: number){
        this.wrBuf.setUint8(this.wrIdx, val);
        this.wrIdx += 1;
    }

    modify_uint8(val: number, idx: number){
        this.wrBuf.setUint8(idx, val);
    }

    write_uint16_LE(val: number){
        this.wrBuf.setUint16(this.wrIdx, val, true);
        this.wrIdx += 2;
    }

    write_int16_LE(val: number){
        this.wrBuf.setInt16(this.wrIdx, val, true);
        this.wrIdx += 2;
    }

    modify_uint16_LE(val: number, idx: number){
        this.wrBuf.setUint16(idx, val, true);

    }

    write_uint32_LE(val: number){
        this.wrBuf.setUint32(this.wrIdx, val, true);
        this.wrIdx += 4;
    }

    write_uint64_LE(val: number){
        this.wrBuf.setFloat64(this.wrIdx, val, true);
        this.wrIdx += 8;
    }
}

/*
export class rwBuf_t {

    rdIdx = 0;
    wrIdx = 0;

    rdBuf: any;
    wrBuf: any;

    constructor(){

    }

    read_uint8(){
        const val = this.rdBuf.readUInt8(this.rdIdx);
        this.rdIdx += 1;
        return val;
    }

    read_uint16_LE(){
        const val = this.rdBuf.readUInt16LE(this.rdIdx);
        this.rdIdx += 2;
        return val;
    }

    read_uint32_LE(){
        const val = this.rdBuf.readUInt32LE(this.rdIdx);
        this.rdIdx += 4;
        return val;
    }

    read_double_LE(){
        const val = this.rdBuf.readDoubleLE(this.rdIdx);
        this.rdIdx += 8;
        return val;
    }

    write_uint8(val: number){
        this.wrBuf.writeUInt8(val, this.wrIdx);
        this.wrIdx += 1;
    }

    modify_uint8(val: number, idx: number){
        this.wrBuf.writeUInt8(val, idx);
    }

    write_uint16_LE(val: number){
        this.wrBuf.writeUInt16LE(val, this.wrIdx);
        this.wrIdx += 2;
    }

    write_int16_LE(val: number){
        this.wrBuf.writeInt16LE(val, this.wrIdx);
        this.wrIdx += 2;
    }

    modify_uint16_LE(val: number, idx: number){
        this.wrBuf.writeUInt16LE(val, idx);

    }

    write_uint32_LE(val: number){
        this.wrBuf.writeUInt32LE(val, this.wrIdx);
        this.wrIdx += 4;
    }

    write_double_LE(val: number){
        this.wrBuf.writeDoubleLE(val, this.wrIdx);
        this.wrIdx += 8;
    }
}
*/




