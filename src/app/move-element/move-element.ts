import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
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
    selector: 'app-move-element',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './move-element.html',
    styleUrls: ['./move-element.scss'],
})
export class MoveElement implements AfterViewInit {

    @ViewChild('scrollSel') scrollSelRef!: ElementRef;
    @HostBinding('attr.id') hostID = 'move-dlg';

    title = '';

    allScrolls: gIF.scroll_t[] = [];
    selScroll = {} as gIF.scroll_t;
    scrollIdx = 0;

    selAttr = {} as gIF.keyVal_t;
    containerRef: any;
    imgDim = {} as gIF.imgDim_t;
    dragRef!: CdkDrag;
    prevPos: any;

    startFlag = true;

    constructor(
        private modal: ModalService,
        public events: EventsService,
        public storage: StorageService
    ) {
        // ---
    }

    /***********************************************************************************************
     * @fn          ngAfterViewInit
     *
     * @brief
     *
     */
    ngAfterViewInit(): void {

        setTimeout(() => {
            this.selAttr = this.modal.dlgData.selAttr;
            this.containerRef = this.modal.dlgData.containerRef;
            this.title = `${this.selAttr.value.name}`;
            this.selAttr.value.drag = true;

            this.imgDim.height = this.modal.dlgData.imgDim.height;
            this.imgDim.width = this.modal.dlgData.imgDim.width;

            this.dragRef = this.modal.dlgData.dragRef;
            this.prevPos = this.dragRef.getFreeDragPosition();

            this.allScrolls = JSON.parse(this.modal.dlgData.scrolls);
            this.allScrolls[0].name = 'move to'
            this.selScroll = this.allScrolls[0];
            this.scrollIdx = 0;
            this.scrollSelRef.nativeElement.value = '0';
        }, 0);
    }

    /***********************************************************************************************
     * fn          scrollSelChange
     *
     * brief
     *
     */
    onScrollSelected(idx: string){

        this.scrollIdx = parseInt(idx);
        this.scrollSelect(this.scrollIdx);
    }

    /***********************************************************************************************
     * fn          scrollSelChange
     *
     * brief
     *
     */
    scrollSelect(idx: number){

        if(this.startFlag == true){
            this.startFlag = false;
            this.allScrolls.shift();
            idx--;
            this.scrollIdx = idx;
            setTimeout(()=>{
                this.scrollSelect(this.scrollIdx);
            }, 0);
            return;
        }
        this.scrollIdx = idx;
        this.scrollSelRef.nativeElement.value = `${this.scrollIdx}`;
        this.selScroll = this.allScrolls[idx];

        if(this.allScrolls.length){
            const x = 0;
            const y = (this.selScroll.yPos * this.imgDim.height) / 100;

            this.containerRef.scrollTo({
                top: y,
                left: x,
                behavior: 'smooth'
            });
            this.dragRef.setFreeDragPosition({x: x, y: y});
        }
    }

    /***********************************************************************************************
     * fn          save
     *
     * brief
     *
     */
    save() {

        const evtPos = this.dragRef.getFreeDragPosition();
        let pos: gIF.nsPos_t = {
            x: evtPos.x / this.imgDim.width,
            y: evtPos.y / this.imgDim.height,
        };
        this.selAttr.value.pos = pos;
        this.storage.setAttrPos(pos, this.selAttr);
        this.selAttr.value.drag = false;

        this.modal.closeDlg();
    }

    /***********************************************************************************************
     * fn          close
     *
     * brief
     *
     */
    close() {

        this.selAttr.value.drag = false;
        this.modal.closeDlg();
    }

}


