import {
    Component,
    ViewChild,
    ElementRef,
    AfterViewInit,
    HostBinding
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { StorageService } from '../services/storage.service';
import { EventsService } from '../services/events.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import * as gConst from '../gConst';
import * as gIF from '../gIF'

@Component({
    selector: 'app-set-styles',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './set-styles.html',
    styleUrls: ['./set-styles.scss'],
})
export class SetStyles implements AfterViewInit {

    @HostBinding('attr.id') hostID = 'styles-dlg';

    @ViewChild('testView') testView!: ElementRef;

    @ViewChild('attrColor') attrColor!: ElementRef;
    @ViewChild('attrFontSize') fontSizeRef!: ElementRef;

    @ViewChild('attrBorderWidth') borderWidthRef!: ElementRef;
    @ViewChild('attrBorderRadius') borderRadiusRef!: ElementRef;

    @ViewChild('attrPaddingTop') paddingTopRef!: ElementRef;
    @ViewChild('attrPaddingRight') paddingRightRef!: ElementRef;
    @ViewChild('attrPaddingBottom') paddingBottomRef!: ElementRef;
    @ViewChild('attrPaddingLeft') paddingLeftRef!: ElementRef;

    dlg_title = '';
    testEl = {} as HTMLElement;
    test_text = '';

    minFontSize = 5
    maxFontSize = 50;
    maxBorderWidth = 6;
    maxBorderRadius = 20;
    maxPaddingTop = 20;
    maxPaddingRight = 20;
    maxPaddingBottom = 20;
    maxPaddingLeft = 20;

    borderStyles = gConst.BORDER_STYLES;
    style = {} as gIF.ngStyle_t;

    constructor(
        public modal: ModalService,
        public events: EventsService,
        public storage: StorageService
    ) {
        // copy style
        this.style = JSON.parse(JSON.stringify(this.modal.dlgData.keyVal.value.style));
        this.test_text = this.modal.dlgData.keyVal.value.formatedVal;
        this.dlg_title = this.modal.dlgData.keyVal.value.name;
    }
    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
    ngAfterViewInit(): void {

        this.testEl = this.testView.nativeElement;

        this.testEl.style.color = this.style.color
        const rgba = this.hexToRGB(this.style.bgColor, this.style.bgOpacity);
        this.testEl.style.backgroundColor = rgba;
        this.testEl.style.fontSize = `${this.style.fontSize}px`;

        this.testEl.style.borderColor = this.style.borderColor;
        this.testEl.style.borderWidth = `${this.style.borderWidth}px`;
        this.testEl.style.borderStyle = this.style.borderStyle;
        this.testEl.style.borderRadius = `${this.style.borderRadius}px`;

        this.testEl.style.paddingTop = `${this.style.paddingTop}px`;
        this.testEl.style.paddingRight = `${this.style.paddingRight}px`;
        this.testEl.style.paddingBottom = `${this.style.paddingBottom}px`;
        this.testEl.style.paddingLeft = `${this.style.paddingLeft}px`;

        setTimeout(() => {
            this.attrColor.nativeElement.focus();
            this.attrColor.nativeElement.select();
        }, 0);
    }

    /***********************************************************************************************
     * fn          onColorChange
     *
     * brief
     *
     */
    onColorChange(newVal: string){

        console.log(`new color: ${newVal}`);

        this.style.color = newVal
        this.testEl.style.color = newVal;
    }

    /***********************************************************************************************
     * fn          onBackgroundColorChange
     *
     * brief
     *
     */
    onBackgroundColorChange(newVal: string){

        console.log(`new background color: ${newVal}`);

        const rgba = this.hexToRGB(newVal, this.style.bgOpacity);
        console.log(`rgba: ${rgba}`);
        this.style.bgColor = newVal;
        this.testEl.style.backgroundColor = rgba;
    }

    /***********************************************************************************************
     * fn          onOpacityChange
     *
     * brief
     *
     */
    onOpacityChange(newVal: string){

        const opacity = parseFloat(newVal);

        console.log(`new opacity: ${newVal}`);
        this.style.bgOpacity = opacity;
        const rgba = this.hexToRGB(this.style.bgColor, opacity);
        console.log(`rgba: ${rgba}`);
        this.testEl.style.backgroundColor = rgba;
    }

    /***********************************************************************************************
     * fn          onFontSizeChange
     *
     * brief
     *
     */
    onFontSizeChange(newVal: string){

        let font_size = parseInt(newVal, 10);

        if(Number.isNaN(font_size) || (font_size < this.minFontSize)){
            return;
        }
        if(font_size > this.maxFontSize){
            font_size = this.maxFontSize;
        }
        console.log(`new font size: ${font_size}`);
        this.style.fontSize = font_size;
        this.testEl.style.fontSize = `${font_size}px`;
        this.fontSizeRef.nativeElement.value = `${font_size}`;
    }

    /***********************************************************************************************
     * fn          onFontSizeBlur
     *
     * brief
     *
     */
    onFontSizeBlur(newVal: string){

        let font_size = parseInt(newVal);

        if(Number.isNaN(font_size) || (font_size < this.minFontSize)){
            this.fontSizeRef.nativeElement.value = `${this.style.fontSize}`;
        }
    }

    /***********************************************************************************************
     * fn          onBorderColorChange
     *
     * brief
     *
     */
    onBorderColorChange(newVal: string){

        if(newVal != this.style.borderColor){
            console.log(`new border color: ${newVal}`);
            this.style.borderColor = newVal;
            this.testEl.style.borderColor = newVal;
        }
    }

    /***********************************************************************************************
     * fn          onBorderWidthChange
     *
     * brief
     *
     */
    onBorderWidthChange(newVal: string){

        let border_width = parseInt(newVal, 10);

        if(Number.isNaN(border_width)){
            return;
        }
        if(border_width > this.maxBorderWidth){
            border_width = this.maxBorderWidth;
        }
        console.log(`new border width: ${border_width}`);
        this.style.borderWidth = border_width;
        this.testEl.style.borderWidth = `${border_width}px`;
        this.borderWidthRef.nativeElement.value = `${border_width}`;
    }

    /***********************************************************************************************
     * fn          onBorderWidthBlur
     *
     * brief
     *
     */
    onBorderWidthBlur(newVal: string){

        let border_width = parseInt(newVal, 10);

        if(Number.isNaN(border_width)){
            this.borderWidthRef.nativeElement.value = `${this.style.borderWidth}`;
        }
    }

    /***********************************************************************************************
     * fn          onBorderRadiusChange
     *
     * brief
     *
     */
    onBorderRadiusChange(newVal: string){

        let border_radius = parseInt(newVal, 10);

        if(Number.isNaN(border_radius)){
            return;
        }
        if(border_radius > this.maxBorderRadius){
            border_radius = this.maxBorderRadius;
        }
        console.log(`new border radius: ${border_radius}`);
        this.style.borderRadius = border_radius;
        this.testEl.style.borderRadius = `${border_radius}px`;
        this.borderRadiusRef.nativeElement.value = `${border_radius}`;
    }

    /***********************************************************************************************
     * fn          onBorderWidthBlur
     *
     * brief
     *
     */
    onBorderRadiusBlur(newVal: string){

        let border_radius = parseInt(newVal, 10);

        if(Number.isNaN(border_radius)){
            this.borderRadiusRef.nativeElement.value = `${this.style.borderRadius}`;
        }
    }

    /***********************************************************************************************
     * fn          onBorderStyleChange
     *
     * brief
     *
     */
    onBorderStyleChange(newStyle: string){

        console.log(`new border style: ${newStyle}`);
        this.style.borderStyle = newStyle;
        this.testEl.style.borderStyle = newStyle;
    }

    /***********************************************************************************************
     * fn          onPaddingTopChange
     *
     * brief
     *
     */
    onPaddingTopChange(newVal: string){

        let padding_top = parseInt(newVal, 10);

        if(Number.isNaN(padding_top)){
            return;
        }
        if(padding_top > this.maxPaddingTop){
            padding_top = this.maxPaddingTop;
        }
        console.log(`new padding top: ${padding_top}`);
        this.style.paddingTop = padding_top;
        this.testEl.style.paddingTop = `${padding_top}px`;
        this.paddingTopRef.nativeElement.value = `${padding_top}`;
    }

    /***********************************************************************************************
     * fn          onPaddingTopBlur
     *
     * brief
     *
     */
    onPaddingTopBlur(newVal: string){

        let padding_top = parseInt(newVal, 10);

        if(Number.isNaN(padding_top)){
            this.paddingTopRef.nativeElement.value = `${this.style.paddingTop}`;
        }
    }

    /***********************************************************************************************
     * fn          onPaddingRightChange
     *
     * brief
     *
     */
    onPaddingRightChange(newVal: string){

        let padding_right = parseInt(newVal, 10);

        if(Number.isNaN(padding_right)){
            return;
        }
        if(padding_right > this.maxPaddingRight){
            padding_right = this.maxPaddingRight;
        }
        console.log(`new padding right ${padding_right}`);
        this.style.paddingRight = padding_right;
        this.testEl.style.paddingRight = `${padding_right}px`;
        this.paddingRightRef.nativeElement.value = `${padding_right}`;
    }

    /***********************************************************************************************
     * fn          onPaddingRightBlur
     *
     * brief
     *
     */
    onPaddingRightBlur(newVal: string){

        let padding_right= parseInt(newVal, 10);

        if(Number.isNaN(padding_right)) {
            this.paddingRightRef.nativeElement.value = `${this.style}`;
        }
    }

    /***********************************************************************************************
     * fn          onPaddingBottomChange
     *
     * brief
     *
     */
    onPaddingBottomChange(newVal: string){

        let padding_bottom = parseInt(newVal, 10);

        if(Number.isNaN(padding_bottom)){
            return;
        }
        if(padding_bottom > this.maxPaddingBottom){
            padding_bottom = this.maxPaddingBottom;
        }
        console.log(`new padding bottom ${padding_bottom}`);
        this.style.paddingBottom = padding_bottom;
        this.testEl.style.paddingBottom = `${padding_bottom}px`;
        this.paddingBottomRef.nativeElement.value = `${padding_bottom}`;
    }

    /***********************************************************************************************
     * fn          onPaddingBottomBlur
     *
     * brief
     *
     */
    onPaddingBottomBlur(newVal: string){

        let padding_bottom= parseInt(newVal, 10);

        if(Number.isNaN(padding_bottom)) {
            this.paddingBottomRef.nativeElement.value = `${this.style.paddingBottom}`;
        }
    }

    /***********************************************************************************************
     * fn          onPaddingLeftChange
     *
     * brief
     *
     */
    onPaddingLeftChange(newVal: string){

        let padding_left = parseInt(newVal, 10);

        if(Number.isNaN(padding_left)){
            return;
        }
        if(padding_left > this.maxPaddingLeft){
            padding_left = this.maxPaddingLeft;
        }
        console.log(`new padding left ${padding_left}`);
        this.style.paddingLeft = padding_left;
        this.testEl.style.paddingLeft = `${padding_left}px`;
        this.paddingLeftRef.nativeElement.value = `${padding_left}`;
    }

    /***********************************************************************************************
     * fn          onPaddingLeftBlur
     *
     * brief
     *
     */
    onPaddingLeftBlur(newVal: string){

        let padding_left = parseInt(newVal, 10);

        if(Number.isNaN(padding_left)) {
            this.paddingLeftRef.nativeElement.value = `${this.style.paddingLeft}`;
        }
    }

    /***********************************************************************************************
     * fn          save
     *
     * brief
     *
     */
    save() {

        this.storage.setAttrStyle(this.style, this.modal.dlgData.keyVal);
        console.log(this.style);
        this.modal.closeDlg();
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
     * @fn          hexToRGB
     *
     * @brief
     *
     */
    hexToRGB(hex: string, alpha: number) {

        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);

        return `rgba(${r},${g},${b},${alpha})`;
    }

}
