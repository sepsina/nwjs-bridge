import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    NgZone,
    OnDestroy
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
import { CommonModule } from '@angular/common';
//import { FormsModule } from '@angular/forms';

import { ModalService } from './services/modal.service';
import { StorageService } from './services/storage.service';
import { EventsService } from './services/events.service';
import { SerialLinkService } from './services/serial-link.service';
import { UtilsService } from './services/utils.service';
// test
import { TestService } from './services/test.service';
// test

import * as gConst from './gConst';
import * as gIF from './gIF';


const wait_msg = '--------';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        //FormsModule,
        DragDropModule,
        CdkContextMenuTrigger,
        CdkMenu,
        CdkMenuItem,
        ResizeObserverDirective
    ],
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('containerRef') containerRef!: ElementRef;
    @ViewChild('floorPlanRef') floorPlanRef!: ElementRef;
    @ViewChild('scrollSel') scrollSelRef!: ElementRef;

    @ViewChild(CdkContextMenuTrigger) ctxMenu!: CdkContextMenuTrigger;


    bkgImgWidth = 0;
    bkgImgHeight = 0;
    imgUrl = '';
    imgDim = {} as gIF.imgDim_t;
    planPath = '';

    scrolls: gIF.scroll_t[] = [gConst.dumyScroll];
    selScroll = this.scrolls[0];

    partDesc: gIF.partDesc_t[] = [];
    partMap = new Map();

    loadFlag = false;

    dragRef!: CdkDrag;
    selAttr = {} as gIF.keyVal_t;

    ctrlFlag = false;
    graphFlag = false;
    corrFlag = false;
    moveFlag = false;

    footerTmo: any;
    footerStatus = '';

    constructor(
        public storage: StorageService,
        private events: EventsService,
        public modal: ModalService,
        private httpClient: HttpClient,
        private utils: UtilsService,
        private ngZone: NgZone,
        public serialLink: SerialLinkService,
        public testService: TestService
    ) {
        // ---
    }

    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
    ngAfterViewInit() {
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

        window.onbeforeunload = async ()=>{
            // ---
        };

        this.events.subscribe('scrollDlgEvt', (newScrolls: gIF.scroll_t[])=>{
            this.scrolls = newScrolls;
            this.scrolls.unshift(gConst.dumyScroll);
            this.storage.setScrolls(this.scrolls);
            //this.selScroll = this.scrolls[0];
        });

        try {
            window.resizeTo(window.screen.availWidth, window.screen.availHeight);
            window.resizeBy(-100, -100);
            window.moveTo(50, 50);
        } catch(e) {
            console.log(e);
        }

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
     * fn          init
     *
     * brief
     *
     */
    init() {
        /*
        setTimeout(() => {
            (<any>window).resizeTo(screen.availWidth, screen.availHeight);
        }, 1000);
        */
        const partsURL = '/assets/parts.json';

        this.httpClient.get(partsURL).subscribe({
            //next: (parts: gIF.partDesc_t[])=>{
            next: (parts: any)=>{
                this.partDesc = [];
                this.partMap.clear();
                for(let desc of parts){
                    this.partDesc.push(desc);
                    let part = {} as gIF.part_t;
                    part.devName = desc.devName;
                    part.part = desc.part;
                    part.url = desc.url;
                    this.partMap.set(desc.partNum, part);
                }
                //console.log(JSON.stringify(this.partDesc));
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
            const el = this.floorPlanRef.nativeElement;
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

        const nvScrolls = JSON.parse(this.storage.getScrolls());
        if(nvScrolls){
            this.scrolls = [];
            for(let i = 0; i < nvScrolls.length; i++){
                this.scrolls.push(nvScrolls[i]);
            }
            setTimeout(()=>{
                this.scrollSelRef.nativeElement.value = '0';
            }, 0);
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
            'background-color': attr.style.bgColor,
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

        attr.drag = false;
        event.source.element.nativeElement.style.zIndex = '1';

        const evtPos = event.source.getFreeDragPosition();
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

        attr.drag = true;
        event.source.element.nativeElement.style.zIndex = '10000';
    }

    /***********************************************************************************************
     * @fn          setStyles
     *
     * @brief
     *
     */
    setStyles() {

        this.modal.dlgData = {
            keyVal: this.selAttr
        }
        this.modal.dlgType = gIF.eDlgType.E_ATTR_STYLE;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          setName
     *
     * @brief
     *
     */

    setName() {

        this.modal.dlgData = {
            keyVal: this.selAttr
        }
        this.modal.dlgType = gIF.eDlgType.E_ATTR_NAME;
        this.modal.openDlg();
    }
    /***********************************************************************************************
     * @fn          setCorr
     *
     * @brief
     *
     */
    setCorr() {

        this.modal.dlgData = {
            keyVal: this.selAttr
        }
        this.modal.dlgType = gIF.eDlgType.E_UNITS;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          graph
     *
     * @brief
     *
     */
    graph() {
        this.modal.dlgData = {
            keyVal: this.selAttr
        }
        this.modal.dlgType = gIF.eDlgType.E_GRAPH;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          editScrolls
     *
     * @brief
     *
     */
    editScrolls() {

        this.modal.dlgData = {
            scrolls: this.scrolls,
            containerRef: this.containerRef.nativeElement,
            imgDim: this.imgDim,
        }
        this.modal.dlgType = gIF.eDlgType.E_SCROLLS;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          moveElement
     *
     * @brief
     *
     */
    moveElement() {

        this.modal.dlgData = {
            scrolls: JSON.stringify(this.scrolls),
            containerRef: this.containerRef.nativeElement,
            imgDim: this.imgDim,
            selAttr: this.selAttr,
            dragRef: this.dragRef
        }
        this.modal.dlgType = gIF.eDlgType.E_MOVE;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          editBinds
     *
     * @brief
     *
     */
    editBinds() {
        this.modal.dlgData = {
            partsMap: this.partMap
        }
        this.modal.dlgType = gIF.eDlgType.E_BINDS;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          editThermostats
     *
     * @brief
     *
     */
    editThermostats() {

        this.modal.dlgData = {
            partsMap: this.partMap
        }
        this.modal.dlgType = gIF.eDlgType.E_STATS;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          showLogs
     *
     * @brief
     *
     */
    showLogs() {

        this.modal.dlgType = gIF.eDlgType.E_LOGS
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          showAbout
     *
     * @brief
     *
     */
    showAbout() {

        this.modal.dlgData = {
            attr: this.selAttr.value,
            partsMap: this.partMap
        }
        this.modal.dlgType = gIF.eDlgType.E_ABOUT;
        this.modal.openDlg();
    }

    /***********************************************************************************************
     * @fn          showSSR
     *
     * @brief
     *
     */
    showSSR() {
        this.modal.dlgData = {
            attr: this.selAttr.value
        }
        this.modal.dlgType = gIF.eDlgType.E_SSR;
        this.modal.openDlg();
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
            const y = (this.scrolls[i].yPos * this.imgDim.height) / 100;
            this.containerRef.nativeElement.scrollTo({
                top: y,
                left: x,
                behavior: 'smooth'
            });
            setTimeout(() => {
                this.scrollSelRef.nativeElement.value = '0';
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
        this.ngZone.run(()=>{
            this.floorPlanRef.nativeElement.style.height = `${this.imgDim.height}px`
        });
    }

    /***********************************************************************************************
     * fn          mouseEnterAttr
     *
     * brief
     *
     */
    mouseEnterAttr(keyVal: gIF.keyVal_t){

        const attr = keyVal.value;
        const partDesc: gIF.part_t = this.partMap.get(attr.partNum);

        this.footerStatus  = `${attr.name}: `;
        this.footerStatus += `${partDesc.part}`;
        this.footerStatus += ` -> ${partDesc.devName}`;
        this.footerStatus += ` @ ${this.utils.extToHex(attr.extAddr)}`;
        clearTimeout(this.footerTmo);
        this.footerTmo = setTimeout(()=>{
            this.footerStatus = '';
        }, 5000);

    }

    /***********************************************************************************************
     * fn          mouseLeaveAttr
     *
     * brief
     *
     */
    mouseLeaveAttr(){
        this.footerStatus = '';
    }

    /***********************************************************************************************
     * fn          ctxMenuOpened
     *
     * brief
     *
     */
    ctxMenuOpened(keyVal: gIF.keyVal_t, dragRef: CdkDrag){

        this.dragRef = dragRef;
        this.selAttr = keyVal;
        const attr = keyVal.value;

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
        this.moveFlag = false;
        if(this.scrolls.length > 2){
            this.moveFlag = true;
        }
    }

}
