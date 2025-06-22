import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    OnDestroy,
    viewChild,
    inject,
    signal,
    effect,
    ChangeDetectionStrategy
} from '@angular/core';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CdkDrag, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ResizeObserverDirective } from './directives/resize-observer.directive';
import {
    CdkMenu,
    CdkMenuItem,
    CdkContextMenuTrigger,
} from '@angular/cdk/menu';
import {
    Dialog,
    DialogModule
} from '@angular/cdk/dialog';
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';

import { CommonModule } from '@angular/common';

//import { ModalService } from './services/modal.service';
import { StorageService } from './services/storage.service';
import { SerialLinkService } from './services/serial-link.service';
import { UtilsService } from './services/utils.service';
import { UdpService } from './services/udp.service';
//import { SerialPortService } from './services/serial-port.service';
// test
import { TestService } from './services/test.service';
// test

import * as gConst from './gConst';
import * as gIF from './gIF';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        DragDropModule,
        CdkContextMenuTrigger,
        CdkMenu,
        CdkMenuItem,
        ResizeObserverDirective,
        DialogModule,
        OverlayModule
    ],
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    host: {
        '(window:beforeunload)': 'closeComms()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

    containerRef = viewChild.required('containerRef', {read: ElementRef});
    floorPlanRef = viewChild.required('floorPlanRef', {read: ElementRef});
    scrollSelRef = viewChild.required('scrollSel', {read: ElementRef});
    cbDragRef = viewChild.required('cbDrag', {read: ElementRef});

    bkgImgWidth = 0;
    bkgImgHeight = 0;
    imgDim = {} as gIF.imgDim_t;

    partMap = new Map();
    selAttr = {} as gIF.keyVal_t;

    dragFlag = false;
    ctrlFlag = false;
    graphFlag = false;
    corrFlag = false;

    footerTmo: any;
    footerStatus = signal('');

    temp_event = effect(()=>{
        setTimeout(()=>{
            const temp = this.storage.tempEvent();
            this.tempEvent(temp);
        }, 0);
    });

    storage = inject(StorageService);
    httpClient = inject(HttpClient);
    utils = inject(UtilsService);
    serialLink = inject(SerialLinkService);
    udp = inject(UdpService);
    //serial = inject(SerialPortService);
    testService = inject(TestService);
    dialog = inject(Dialog);

    ctx_open = signal(false);
    ctx_origin!: CdkOverlayOrigin;

    constructor() {
        // ---
    }

    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
    ngAfterViewInit() {
        /*
        try {
            window.resizeTo(window.screen.availWidth, window.screen.availHeight);
            window.resizeBy(-100, -100);
            window.moveTo(50, 50);
        } catch(e) {
            console.log(e);
        }
        */
        /*
        const net = window.nw.require('net');
        const client = new net.Socket();
        client.connect(4443, 'localhost', ()=>{
            client.write('loaded');
        });
        client.on('data', (data: any)=>{
            console.log('Received: ' + data);
            client.destroy(); // kill client after server's response
        });
        client.on('close', ()=>{
            console.log('Connection closed');
        });
        window.nw.Window.get().show();
        */
        setTimeout(() => {
            this.init();
        }, 10);
    }

    /***********************************************************************************************
     * fn          ngOnInit
     *
     * brief
     *
     */
    ngOnInit() {
        setTimeout(() => {
            this.serialLink.initApp();
        }, 100);
    }

    /***********************************************************************************************
     * fn          ngOnDestroy
     *
     * brief
     *
     */
    ngOnDestroy() {
        // ---
    }

    /***********************************************************************************************
     * fn          closeComms
     *
     * brief
     *
     */
    closeComms(){
        this.udp.closeSocket();
        //this.serial.closeComPort();
    };

    /***********************************************************************************************
     * fn          init
     *
     * brief
     *
     */
    init() {

        const partsURL = '/assets/parts.json';

        this.httpClient.get(partsURL).subscribe({
            next: (parts: any)=>{
                this.partMap.clear();
                for(let desc of parts){
                    let part = {} as gIF.part_t;
                    part.devName = desc.devName;
                    part.part = desc.part;
                    part.url = desc.url;
                    this.partMap.set(desc.partNum, part);
                }
            },
            error: (err: HttpErrorResponse)=>{
                console.log(err.message);
            }
        });

        const bkgImgPath = '/assets/floor_plan.jpg';
        let bkgImg = new Image();
        bkgImg.onload = ()=>{
            this.bkgImgWidth = bkgImg.width;
            this.bkgImgHeight = bkgImg.height;
            const el = this.floorPlanRef().nativeElement;
            let divDim = el.getBoundingClientRect();
            this.imgDim.width = divDim.width;
            this.imgDim.height = Math.round((divDim.width / bkgImg.width) * bkgImg.height);
            el.style.height = `${this.imgDim.height}px`;
            el.style.backgroundImage = `url(${bkgImgPath})`
            el.style.backgroundAttachment = 'scroll';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundSize = 'contain';
        };
        bkgImg.src = bkgImgPath;

        const scrolls = this.storage.getScrolls();
        if(scrolls){
            const nvScrolls = JSON.parse(this.storage.getScrolls());
            if(nvScrolls){
                this.storage.scrolls.set(nvScrolls);
            }
        }
    }

    /***********************************************************************************************
     * fn          getAttrStyle
     *
     * brief
     *
     */
    getAttrStyle(keyVal: gIF.keyVal_t) {

        const attr = keyVal.value;

        let retStyle = {
            'color': attr.style.color,
            'background-color': this.utils.hexToRGB(attr.style.bgColor, attr.style.bgOpacity),
            'font-size.px': attr.style.fontSize,
            'border-color': attr.style.borderColor,
            'border-width.px': attr.style.borderWidth,
            'border-style': attr.style.borderStyle,
            'border-radius.px': attr.style.borderRadius,
            'padding-top.px': attr.style.paddingTop,
            'padding-right.px': attr.style.paddingRight,
            'padding-bottom.px': attr.style.paddingBottom,
            'padding-left.px': attr.style.paddingLeft,
        };
        if(attr.isValid == false) {
            retStyle['color'] = 'gray';
            retStyle['background-color'] = 'transparent';
            retStyle['border-color'] = 'gray';
            retStyle['border-width.px'] = 2;
            retStyle['border-style'] = 'dotted';
        }
        return retStyle;
    }

    /***********************************************************************************************
     * fn          getAttrPosition
     *
     * brief
     *
     */
    getAttrPosition(keyVal: gIF.keyVal_t) {

        const attr = keyVal.value;

        if(attr.drag){
            return undefined;
        }
        return {
            x: attr.pos.x * this.imgDim.width,
            y: attr.pos.y * this.imgDim.height,
        };
    }

    /***********************************************************************************************
     * @fn          onDragEnded
     *
     * @brief
     *
     */
    onDragEnded(event: CdkDragEnd, keyVal: gIF.keyVal_t) {

        const attr = keyVal.value;
        const cdkDrag = event.source;
        const elRef = event.source.element;

        attr.drag = false;
        elRef.nativeElement.style.zIndex = '1';

        const evtPos = cdkDrag.getFreeDragPosition();
        let pos: gIF.nsPos_t = {
            x: evtPos.x / this.imgDim.width,
            y: evtPos.y / this.imgDim.height,
        };
        attr.pos = pos;

        this.storage.setAttrPos(pos, keyVal);
    }

    /***********************************************************************************************
     * @fn          onDragStarted
     *
     * @brief
     *
     */
    onDragStarted(event: CdkDragStart, keyVal: gIF.keyVal_t) {

        const attr = keyVal.value;
        const elRef = event.source.element;

        attr.drag = true;
        elRef.nativeElement.style.zIndex = '10000';
    }

    /***********************************************************************************************
     * @fn          setStyles
     *
     * @brief
     *
     */
    async setStyles() {

        this.ctx_open.set(false);

        const { SetStyles } = await import('./set-styles/set-styles');
        const dlgRef = this.dialog.open(SetStyles, {
            data: {
                keyVal: this.selAttr
            },
            restoreFocus: false
        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`set styles dlg data: ${data}`);
            this.storage.attrMap.update((map)=>{
                return new Map(map);
            });
        });
    }

    /***********************************************************************************************
     * @fn          setName
     *
     * @brief
     *
     */

    async setName() {

        this.ctx_open.set(false);

        const { SetName } = await import('./set-name/set-name');
        const dlgRef = this.dialog.open(SetName, {
            data: {
                keyVal: this.selAttr
            },
            restoreFocus: false
        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`set name dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          setCorr
     *
     * @brief
     *
     */
    async setCorr() {

        this.ctx_open.set(false);

        const { SetCorr } = await import('./set-corr/set-corr');
        const dlgRef = this.dialog.open(SetCorr, {
            data: {
                keyVal: this.selAttr
            },
            restoreFocus: false,

        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`set corr dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          graph
     *
     * @brief
     *
     */
    async graph() {

        this.ctx_open.set(false);

        const { Graph } = await import('./graph/graph');
        const dlgRef = this.dialog.open(Graph, {
            data: {
                keyVal: this.selAttr
            },
            restoreFocus: false,

        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`graph dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          editScrolls
     *
     * @brief
     *
     */
    async editScrolls() {

        const { EditScrolls } = await import('./edit-scrolls/edit-scrolls');
        const dlgRef = this.dialog.open(EditScrolls, {
            data: {
                containerRef: this.containerRef().nativeElement,
                imgDim: this.imgDim,
            },
            restoreFocus: false,

        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`scrolls dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          editBinds
     *
     * @brief
     *
     */
    async editBinds() {

        const { EditBinds } = await import('./binds/binds.page');
        const dlgRef = this.dialog.open(EditBinds, {
            data: {
                partsMap: this.partMap
            },
            restoreFocus: false,

        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`binds dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          editThermostats
     *
     * @brief
     *
     */
    async editThermostats() {

        const { EditStats } = await import('./x-stat/x_stat.page');
        const dlgRef = this.dialog.open(EditStats, {
            data: {
                partsMap: this.partMap
            },
            restoreFocus: false,
        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`stats dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          showLogs
     *
     * @brief
     *
     */
    async showLogs() {

        const { ShowLogs } = await import('./logs/show-logs');
        const dlgRef = this.dialog.open(ShowLogs, {
            restoreFocus: false,
        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`logs dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          showAbout
     *
     * @brief
     *
     */
    async showAbout() {

        this.ctx_open.set(false);

        const { About } = await import('./about/about');
        const dlgRef = this.dialog.open(About, {
            data: {
                attr: this.selAttr.value,
                partsMap: this.partMap
            },
            restoreFocus: false,

        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`about dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * @fn          showSSR
     *
     * @brief
     *
     */
    async showSSR() {
        this.ctx_open.set(false);

        const { SSR } = await import('./ssr/ssr');
        const dlgRef = this.dialog.open(SSR, {
            data: {
                attr: this.selAttr.value
            },
            restoreFocus: false,

        });
        dlgRef.closed.subscribe((data)=>{
            console.log(`ssr dlg data: ${data}`);
        });
    }

    /***********************************************************************************************
     * fn          scrollSelChange
     *
     * brief
     *
     */
    scrollSelChange(idx: string){

        const i = parseInt(idx);

        if(i > 0){
            const x = 0;
            const y = (this.storage.scrolls()[i].yPos * this.imgDim.height) / 100;
            this.containerRef().nativeElement.scrollTo({
                top: y,
                left: x,
                behavior: 'smooth'
            });
            setTimeout(() => {
                this.scrollSelRef().nativeElement.value = '0';
            }, 1000);
        }
    }

    /***********************************************************************************************
     * fn          onResize
     *
     * brief
     *
     */
    onResize(event: any) {

        const rect = event.contentRect;
        console.log(`w: ${rect.width}, h: ${rect.height}`);

        this.imgDim.width = rect.width;
        this.imgDim.height = Math.round((rect.width / this.bkgImgWidth) * this.bkgImgHeight);

        this.floorPlanRef().nativeElement.style.height = `${this.imgDim.height}px`
    }

    /***********************************************************************************************
     * fn          mouseEnterAttr
     *
     * brief
     *
     */
    mouseEnterAttr(keyVal: gIF.keyVal_t, dragRef: CdkDrag){

        const attr = keyVal.value;
        const htmlEl = dragRef.element.nativeElement;
        const partDesc: gIF.part_t = this.partMap.get(attr.partNum);

        htmlEl.style.backgroundColor = 'yellow';
        if(this.dragFlag){
            dragRef.disabled = false;
            htmlEl.style.cursor = 'move';
        }
        else {
            dragRef.disabled = true;
            htmlEl.style.cursor = 'pointer';
        }
        let status = '';
        status  = `${attr.name}: `;
        status += `${partDesc.part}`;
        status += ` -> ${partDesc.devName}`;
        status += ` @ ${this.utils.extToHex(attr.extAddr)}`;
        this.footerStatus.set(status);
        clearTimeout(this.footerTmo);
        this.footerTmo = setTimeout(()=>{
            this.footerStatus.set('');
        }, 5000);
    }

    /***********************************************************************************************
     * fn          mouseLeaveAttr
     *
     * brief
     *
     */
    mouseLeaveAttr(keyVal: gIF.keyVal_t, attrRef: HTMLDivElement){

        this.footerStatus.set('');

        attrRef.style.backgroundColor = this.utils.hexToRGB(keyVal.value.style.bgColor,
                                                            keyVal.value.style.bgOpacity);
        attrRef.style.cursor = 'default';
    }

    /***********************************************************************************************
     * fn          dragChanged
     *
     * brief
     *
     */
    dragChanged(){

        if(this.cbDragRef().nativeElement.checked) {
            this.dragFlag = true;
        }
        else {
            this.dragFlag = false;
        }
    }

    /***********************************************************************************************
     * fn          ctxMenuOpened
     *
     * brief
     *
     */
    ctxMenuOpen(keyVal: gIF.keyVal_t, origin: CdkOverlayOrigin){

        if(this.dragFlag == true){
            return;
        }
        this.selAttr = keyVal;
        const attr = keyVal.value;
        this.ctx_origin = origin;

        this.ctrlFlag = false;
        this.corrFlag = false;
        switch(attr.partNum){
            case gConst.ACUATOR_010_ON_OFF:
            case gConst.SSR_009_RELAY: {
                this.ctrlFlag = true;
                break;
            }
            case gConst.SHT40_018_T:
            case gConst.SHT40_018_RH:
            case gConst.SI7021_027_T:
            case gConst.SI7021_027_RH:
            case gConst.HTU21D_005_T:
            case gConst.HTU21D_005_RH: {
                this.corrFlag = true;
                break;
            }
        }
        this.graphFlag = false;
        if(attr.attrVals.length > 1){
            this.graphFlag = true;
        }

        this.ctx_open.set(true);
    }

    /***********************************************************************************************
     * fn          moveTo
     *
     * brief
     *
     */
    moveTo(idx: number){

        const x = 0;
        const y = (this.storage.scrolls()[idx].yPos * this.imgDim.height) / 100;

        this.containerRef().nativeElement.scrollTo({
            top: y,
            left: x,
            behavior: 'smooth'
        });
        let pos: gIF.nsPos_t = {
            x: x / this.imgDim.width,
            y: y / this.imgDim.height,
        };
        this.selAttr.value.pos = pos;
        this.storage.setAttrPos(pos, this.selAttr);
    }

    /***********************************************************************************************
     * fn          tempEvent
     *
     * brief
     *
     */
    tempEvent(event: gIF.tempEvent_t){

        const key = this.storage.thermostatKey(event.extAddr, event.endPoint);
        const nvThermostat: gIF.thermostat_t = this.storage.nvThermostatsMap.get(key);
        if(nvThermostat){
            if(nvThermostat.actuators.length){
                let changed = false;
                if(nvThermostat.setPoint !== nvThermostat.prevSetPoint){
                    changed = true;
                    nvThermostat.prevSetPoint = nvThermostat.setPoint;
                    nvThermostat.workPoint = nvThermostat.setPoint - nvThermostat.hysteresis;
                }
                if(event.temp > nvThermostat.workPoint){
                    if(nvThermostat.workPoint > nvThermostat.setPoint){
                        changed = true;
                        nvThermostat.workPoint = nvThermostat.setPoint - nvThermostat.hysteresis;
                    }
                }
                if(event.temp < nvThermostat.workPoint){
                    if(nvThermostat.workPoint < nvThermostat.setPoint){
                        changed = true;
                        nvThermostat.workPoint = nvThermostat.setPoint + nvThermostat.hysteresis;
                    }
                }
                if(changed){
                    this.storage.storeThermostat(nvThermostat);
                }

                let cmd = 0x00; // OFF
                if(event.temp < nvThermostat.workPoint){
                    cmd = 0x01; // ON
                }
                for(const on_off of nvThermostat.actuators){
                    const zclCmd = {} as gIF.udpZclReq_t;
                    zclCmd.ip = '';  // not used
                    zclCmd.port = 0; // not used
                    zclCmd.extAddr = on_off.extAddr;
                    zclCmd.endPoint = on_off.endPoint;
                    zclCmd.clusterID = gConst.CLUSTER_ID_GEN_ON_OFF;
                    zclCmd.hasRsp = 0;
                    zclCmd.cmdLen = 3;
                    zclCmd.cmd = [];
                    zclCmd.cmd[0] = 0x11; // cluster spec cmd, not manu spec, client to srv dir, disable dflt rsp
                    zclCmd.cmd[1] = 0x00; // seq num -> not used
                    zclCmd.cmd[2] = cmd;  // ON/OFF command

                    this.storage.zclCmd.set(zclCmd);
                }
            }
        }
    }

    /***********************************************************************************************
     * fn          disableRightClick
     *
     * brief
     *
     */
    disableRightClick(event: MouseEvent){
        event.preventDefault();
    }

    /***********************************************************************************************
     * fn          ctxClose
     *
     * brief
     *
     */
    ctxKeyEvt(event: KeyboardEvent){

        console.log(event);

        if(event.key == 'Escape'){
            this.ctx_open.set(false);
        }
    }

}
