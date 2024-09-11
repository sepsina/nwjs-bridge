import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
    HostBinding
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { EventsService } from '../services/events.service';
import { StorageService } from '../services/storage.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import * as gIF from '../gIF';
import * as gConst from '../gConst';

@Component({
    selector: 'app-edit-scrolls',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './edit-scrolls.html',
    styleUrls: ['./edit-scrolls.scss']
})
export class EditScrolls implements AfterViewInit {

    @ViewChild('scrollName') scrollNameRef!: ElementRef;
    @ViewChild('scrollSel') scrollSelRef!: ElementRef;
    @ViewChild('yPos') yPosRef!: ElementRef;

    @HostBinding('attr.id') hostID = 'scrolls-dlg';

    minPos = 0;
    maxPos = 100;
    maxNameLen = 16;

    scroll_name = '';
    scroll_idx = 0;
    y_pos = 0;

    allScrolls: gIF.scroll_t[] = [];
    selScroll = {} as gIF.scroll_t;

    newIdx: number = 0;

    constructor(
        private modal: ModalService,
        private events: EventsService,
        private storage: StorageService
    ) {
        //this.modal.dlgData.scrolls.splice(0, 1);
        this.allScrolls = JSON.parse(JSON.stringify(this.modal.dlgData.scrolls));
        this.allScrolls.splice(0, 1);
    }

    /***********************************************************************************************
     * @fn          ngAfterViewInit
     *
     * @brief
     *
     */
    ngAfterViewInit(): void {
        setTimeout(() => {
            if(this.allScrolls.length == 0){
                this.addScroll();
            }
            else {
                this.scrollSelect(0);
            }
        }, 0);
    }

    /***********************************************************************************************
     * fn          onScrollSelected
     *
     * brief
     *
     */
    onScrollSelected(idx: string){
        this.scroll_idx = parseInt(idx);
        this.scrollSelect(this.scroll_idx);
    }

    /***********************************************************************************************
     * fn          scrollSelect
     *
     * brief
     *
     */
    scrollSelect(idx: number){

        this.selScroll = this.allScrolls[idx];
        this.scroll_name = this.selScroll.name;
        this.scroll_idx = idx;

        this.scrollSelRef.nativeElement.value = `${this.scroll_idx}`;
        this.scrollNameRef.nativeElement.value = this.selScroll.name
        this.yPosRef.nativeElement.value = `${this.selScroll.yPos}`;

        this.yPosSet(this.selScroll.yPos);
    }

    /***********************************************************************************************
     * @fn          onNameChange
     *
     * @brief
     *
     */
    onNameChange(newName: string){

        console.log(`new val: ${newName}`);

        const nameLen = newName.length;
        if(newName == '') {
            return;
        }
        if(nameLen > this.maxNameLen){
            this.scrollNameRef.nativeElement.value = this.scroll_name;
            return;
        }
        this.scroll_name = newName;
        this.selScroll.name = newName
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
            this.scrollNameRef.nativeElement.value = this.scroll_name;
        }
    }

    /***********************************************************************************************
     * fn          onPosChange
     *
     * brief
     *
     */
    onPosChange(newVal: string){

        let new_pos = parseInt(newVal, 10);

        if(Number.isNaN(new_pos ) || (new_pos  < this.minPos)){
            return;
        }
        if(new_pos  > this.maxPos){
            new_pos = this.maxPos;
        }
        console.log(`new set pos: ${new_pos}`);
        this.selScroll.yPos = new_pos ;
        this.y_pos = new_pos;
        this.yPosSet(new_pos);
    }

    /***********************************************************************************************
     * fn          onPosBlur
     *
     * brief
     *
     */
    onPosBlur(newVal: string){

        let set_point = parseInt(newVal);

        if(Number.isNaN(set_point) || (set_point < this.minPos)){
            this.yPosRef.nativeElement.value = `${this.selScroll.yPos}`;
        }
    }

    /***********************************************************************************************
     * @fn          yPosSet
     *
     * @brief
     *
     */
    yPosSet(pos: number) {

        if(pos < 0){
            pos = 0;
        }
        if(pos > this.maxPos){
            return;
        }

        this.modal.dlgData.containerRef.scrollTo({
            top: pos * this.modal.dlgData.imgDim.height / 100,
            left: 0,
            behavior: 'smooth'
        });
    }

    /***********************************************************************************************
     * @fn          addScroll
     *
     * @brief
     *
     */
    addScroll(){

        this.newIdx++;
        const scroll: gIF.scroll_t = {
            name: `new_${this.newIdx}`,
            yPos: 0
        }
        this.allScrolls.push(scroll);
        setTimeout(()=>{
            const lastIdx = this.allScrolls.length - 1;
            this.scrollSelect(lastIdx);
        }, 0);
    }
    /***********************************************************************************************
     * @fn          delScroll
     *
     * @brief
     *
     */
    delScroll(){

        if(this.allScrolls.length == 1){
            return;
        }
        //const i = parseInt(this.scrollIdx);
        const i = parseInt(this.scrollSelRef.nativeElement.value);

        this.allScrolls.splice(i, 1);
        setTimeout(()=>{
            this.scrollSelect(0);
        }, 0);
    }

    /***********************************************************************************************
     * @fn          save
     *
     * @brief
     *
     */
    save() {

        this.events.publish('scrollDlgEvt', this.allScrolls);
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

}
