import { Component,
         OnInit,
         ViewChild,
         ElementRef,
         AfterViewInit,
         OnDestroy,
         NgZone,
         Renderer2 } from '@angular/core';

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
export class SetStyles implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('testView') testView!: ElementRef;

    @ViewChild('attrColor') attrColor!: ElementRef;
    @ViewChild('attrFontSize') fontSizeRef!: ElementRef;

    @ViewChild('attrBorderWidth') borderWidthRef!: ElementRef;
    @ViewChild('attrBorderRadius') borderRadiusRef!: ElementRef;

    @ViewChild('attrPaddingTop') paddingTopRef!: ElementRef;
    @ViewChild('attrPaddingRight') paddingRightRef!: ElementRef;
    @ViewChild('attrPaddingBottom') paddingBottomRef!: ElementRef;
    @ViewChild('attrPaddingLeft') paddingLeftRef!: ElementRef;

    testEl = {} as HTMLElement;
    dlgEl!: ElementRef;

    minFontSize = 5
    maxFontSize = 50;
    maxBorderWidth = 6;
    maxBorderRadius = 20;
    maxPaddingTop = 20;
    maxPaddingRight = 20;
    maxPaddingBottom = 20;
    maxPaddingLeft = 20;

    attr_color = 'black';
    attr_background_color = 'transparent';
    attr_bg_trans = false;
    attr_font_size = 16;

    attr_border_color = 'clack';
    attr_border_width = 1;
    attr_border_radius = 6;
    attr_border_style = 'solid';

    attr_padding_top = 6;
    attr_padding_right = 6;
    attr_padding_bottom = 6;
    attr_padding_left = 6;

    borderStyles!: string[]

    // TEST
    style = {
        color: '#000000',
        bgColor: 'transparent',
        fontSize: 16,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'black',
        borderRadius: 6,
        paddingTop: 10,
        paddingRight: 16,
        paddingBottom: 10,
        paddingLeft: 6
    } as gIF.ngStyle_t;
    // TEST

    selAttr = {} as gIF.hostedAttr_t;

    constructor(public modal: ModalService,
                public events: EventsService,
                public storage: StorageService,
                private element: ElementRef,
                private ngZone: NgZone,
                private renderer: Renderer2) {
        // important
        this.renderer.setStyle(this.element.nativeElement, 'display', 'flex');
        this.renderer.setStyle(this.element.nativeElement, 'height', '100%');

        // TEST
        this.selAttr.style = this.style;
        this.selAttr.formatedVal = '29.6 °C';
        this.selAttr.name = 't_in';

        this.attr_color = this.selAttr.style.color;
        this.attr_background_color = this.selAttr.style.bgColor;
        if(this.selAttr.style.bgColor.toLowerCase() == 'transparent'){
            this.attr_bg_trans = true;
        }
        // TEST

        this.borderStyles = gConst.BORDER_STYLES;

        this.attr_font_size = this.selAttr.style.fontSize;

        this.attr_border_color = this.selAttr.style.borderColor;
        this.attr_border_width = this.selAttr.style.borderWidth;
        this.attr_border_radius = this.selAttr.style.borderRadius;
        this.attr_border_style = this.selAttr.style.borderStyle;

        this.attr_padding_top = this.selAttr.style.paddingTop;
        this.attr_padding_right = this.selAttr.style.paddingRight;
        this.attr_padding_bottom = this.selAttr.style.paddingBottom;
        this.attr_padding_left = this.selAttr.style.paddingLeft;

    }

    ngOnDestroy(): void {
        // ---
    }

    ngAfterViewInit(): void {

        this.testEl = this.testView.nativeElement;

        this.renderer.setStyle(this.testEl, 'color', this.selAttr.style.color);
        this.renderer.setStyle(this.testEl, 'backgroundColor', this.selAttr.style.bgColor);
        this.renderer.setStyle(this.testEl, 'fontSize', `${this.selAttr.style.fontSize}px`);

        this.renderer.setStyle(this.testEl, 'borderColor', this.selAttr.style.borderColor);
        this.renderer.setStyle(this.testEl, 'borderWidth', `${this.selAttr.style.borderWidth}px`);
        this.renderer.setStyle(this.testEl, 'borderStyle', this.selAttr.style.borderStyle);
        this.renderer.setStyle(this.testEl, 'borderRadius', `${this.selAttr.style.borderRadius}px`);

        this.renderer.setStyle(this.testEl, 'paddingTop', `${this.selAttr.style.paddingTop}px`);
        this.renderer.setStyle(this.testEl, 'paddingRight', `${this.selAttr.style.paddingRight}px`);
        this.renderer.setStyle(this.testEl, 'paddingBottom', `${this.selAttr.style.paddingBottom}px`);
        this.renderer.setStyle(this.testEl, 'paddingLeft', `${this.selAttr.style.paddingLeft}px`);

        setTimeout(() => {
            this.attrColor.nativeElement.focus();
            this.attrColor.nativeElement.select();
        }, 0);
    }

    ngOnInit() {
        this.style.color = this.selAttr.style.color;
        this.attr_color = this.style.color;

        this.style.bgColor = this.selAttr.style.bgColor;
        this.style.fontSize = this.selAttr.style.fontSize;

        this.style.borderColor = this.selAttr.style.borderColor;
        this.attr_border_color = this.style.borderColor;

        this.style.borderWidth = this.selAttr.style.borderWidth;
        this.style.borderStyle = this.selAttr.style.borderStyle;
        this.style.borderRadius = this.selAttr.style.borderRadius;

        this.style.paddingTop = this.selAttr.style.paddingTop;
        this.attr_padding_top = this.style.paddingTop;

        this.style.paddingRight = this.selAttr.style.paddingRight;
        this.style.paddingBottom = this.selAttr.style.paddingBottom;
        this.style.paddingLeft = this.selAttr.style.paddingLeft;
    }

    /***********************************************************************************************
     * fn          onColorChange
     *
     * brief
     *
     */
    onColorChange(newVal: string){

        console.log(`new color: ${newVal}`);

        this.attr_color = newVal;
        this.renderer.setStyle(this.testEl, 'color', newVal);
    }

    /***********************************************************************************************
     * fn          onBackgroundColorChange
     *
     * brief
     *
     */
    onBackgroundColorChange(newVal: string){

        console.log(`new background color: ${newVal}`);

        this.attr_background_color = newVal;
        if(this.attr_bg_trans == false){
            this.renderer.setStyle(this.testEl, 'backgroundColor', newVal);
        }
    }

    /***********************************************************************************************
     * fn             onBgTransChange

     *
     * brief
     *
     */
    onBgTransChange(newVal: boolean){

        console.log(`new trans status: ${newVal}`);

        this.attr_bg_trans = newVal;
        if(newVal){
            this.renderer.setStyle(this.testEl, 'backgroundColor', 'transparent');
        }
        else {
            this.renderer.setStyle(this.testEl, 'backgroundColor', this.attr_background_color);
        }
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
        this.attr_font_size = font_size;
        this.renderer.setStyle(this.testEl, 'fontSize', `${this.attr_font_size}px`);

        this.fontSizeRef.nativeElement.value = `${this.attr_font_size}`;
    }

    /***********************************************************************************************
     * fn          onFontSizeBlur
     *
     * brief
     *
     */
    onFontSizeBlur(newVal: string){

        let font_size = parseInt(newVal, 10);

        if(Number.isNaN(font_size) || (font_size < this.minFontSize)){
            this.fontSizeRef.nativeElement.value = `${this.attr_font_size}`;
        }
    }

    /***********************************************************************************************
     * fn          onBorderColorChange
     *
     * brief
     *
     */
    onBorderColorChange(newVal: string){

        if(newVal != this.attr_border_color){
            console.log(`new border color: ${newVal}`);
            this.attr_border_color = newVal;
            this.renderer.setStyle(this.testEl, 'borderColor', newVal);
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
        this.attr_border_width = border_width;
        this.renderer.setStyle(this.testEl, 'borderWidth', `${this.attr_border_width}px`);
        this.borderWidthRef.nativeElement.value = `${this.attr_border_width}`;
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
            this.borderWidthRef.nativeElement.value = `${this.attr_border_width}`;
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
        this.attr_border_radius = border_radius;
        this.renderer.setStyle(this.testEl, 'borderRadius', `${this.attr_border_radius}px`);
        this.borderRadiusRef.nativeElement.value = `${this.attr_border_radius}`;
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
            this.borderRadiusRef.nativeElement.value = `${this.attr_border_radius}`;
        }
    }

    /***********************************************************************************************
     * fn          onBorderStyleChange
     *
     * brief
     *
     */
    onBorderStyleChange(newStyle: string){

        if(newStyle != this.attr_border_style) {
            console.log(`new border style: ${newStyle}`);
            this.attr_border_style = newStyle;
            this.renderer.setStyle(this.testEl, 'borderStyle', this.attr_border_style);
        }
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
        this.attr_padding_top = padding_top;
        this.renderer.setStyle(this.testEl, 'paddingTop', `${this.attr_padding_top}px`);
        this.paddingTopRef.nativeElement.value = `${this.attr_padding_top}`;
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
            this.paddingTopRef.nativeElement.value = `${this.attr_padding_top}`;
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
        this.attr_padding_right = padding_right;
        this.renderer.setStyle(this.testEl, 'paddingRight', `${this.attr_padding_right}px`);
        this.paddingRightRef.nativeElement.value = `${this.attr_padding_right}`;
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
            this.paddingRightRef.nativeElement.value = `${this.attr_padding_right}`;
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
        this.attr_padding_bottom = padding_bottom;
        this.renderer.setStyle(this.testEl, 'paddingBottom', `${this.attr_padding_bottom}px`);
        this.paddingBottomRef.nativeElement.value = `${this.attr_padding_bottom}`;
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
            this.paddingBottomRef.nativeElement.value = `${this.attr_padding_bottom}`;
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
        this.attr_padding_left = padding_left;
        this.renderer.setStyle(this.testEl, 'paddingLeft', `${this.attr_padding_left}px`);
        this.paddingLeftRef.nativeElement.value = `${this.attr_padding_left}`;
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
            this.paddingLeftRef.nativeElement.value = `${this.attr_padding_left}`;
        }
    }

    /***********************************************************************************************
     * fn          save
     *
     * brief
     *
     */
    async save() {
        this.style.color = this.attr_color;
        if(this.attr_bg_trans == true){
            this.style.bgColor = 'transparent';
        }
        else {
            this.style.bgColor = this.attr_background_color;
        }
        this.style.fontSize = this.attr_font_size;

        this.style.borderColor = this.attr_border_color;
        this.style.borderWidth = this.attr_border_width;
        this.style.borderRadius = this.attr_border_radius;
        this.style.borderStyle = this.attr_border_style;

        this.style.paddingTop = this.attr_padding_top;
        this.style.paddingRight = this.attr_padding_right;
        this.style.paddingBottom = this.attr_padding_bottom;
        this.style.paddingLeft = this.attr_padding_left;

        //await this.storage.setAttrStyle(this.style, this.keyVal);
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
     * @fn          isValid
     *
     * @brief
     *
     */
    isValid(){

        return true;
    }

}
