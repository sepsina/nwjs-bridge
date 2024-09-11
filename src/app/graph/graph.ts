import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    HostBinding,
    ElementRef
} from '@angular/core';

import { ModalService } from '../services/modal.service';
import { StorageService } from '../services/storage.service';
import { EventsService } from '../services/events.service';
import { UtilsService } from '../services/utils.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { Subscription } from 'rxjs';

import * as gConst from '../gConst';
import * as gIF from '../gIF'

const noTime = 'time: --:--:--';
const noValue = 'value: --.-';

@Component({
    selector: 'app-graph',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle,
        BaseChartDirective
    ],
    templateUrl: './graph.html',
    styleUrls: ['./graph.scss'],
})
export class Graph implements OnInit, OnDestroy {

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    @HostBinding('attr.id') hostID = 'graph-dlg';

    selAttr = {} as gIF.hostedAttr_t;
    selIdx = -1;
    selTime = noTime;
    selValue = noValue;

    duration = '';

    newDataSubscription!: Subscription;

    constructor(
        private modal: ModalService,
        public events: EventsService,
        public utils: UtilsService,
        public storage: StorageService
    ) {
        this.selAttr = this.modal.dlgData.keyVal.value;
    }

    lineChartData: ChartConfiguration<'line'> ['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                fill: false,
                borderColor: 'black',
                pointHoverRadius: 6,
                pointHitRadius: 20,
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                pointHoverBackgroundColor: 'yellow',
                pointHoverBorderColor: 'red'
            },
        ]
    };
    public lineChartOptions: ChartOptions<'line'> = {
        responsive: true,
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            x: {
                border: {
                    color: 'lightgray'
                },
                grid: {
                    display: false
                },
                ticks: {
                    autoSkip: false,
                    display: false,
                    maxRotation: 0,
                    font: {
                        size: 14,
                    }
                }
            },
            y: {
                position: 'right',
                min: 0,
                max: 1,
                border: {
                    dash: [8, 4],
                    color: 'lightgray'
                },
                grid: {
                    color: 'lightgray',
                    display: true,
                },
                ticks:{
                    stepSize: 1,
                    font: {
                        size: 14,
                    }
                },
            }
        },
        animation: false,
        plugins: {
            tooltip: {
                enabled: true,
                displayColors: false,
            },
        }

    };

    public lineChartLegend = false;

    /***********************************************************************************************
     * fn          ngOnDestroy
     *
     * brief
     *
     */
    ngOnDestroy(): void {
        this.newDataSubscription.unsubscribe();
        // ---
    }

    /***********************************************************************************************
     * fn          ngOnInit
     *
     * brief
     *
     */
    ngOnInit() {

        this.setChartData();

        this.newDataSubscription = this.events.subscribe('newData', (attr: gIF.hostedAttr_t)=>{
            this.newData(attr);
        });

    }
    /***********************************************************************************************
     * fn          setChartData
     *
     * brief
     *
     */
    setChartData() {

        this.lineChartData.labels = [];
        this.lineChartData.datasets[0].data = [];

        const len = this.selAttr.timestamps.length;
        //const start = this.selAttr.timestamps[0];
        const end = this.selAttr.timestamps[len-1];
        let minVal = 1e6;
        let maxVal = -1e6;
        let corrVal = 0;
        let offset = this.selAttr.valCorr.offset;
        for(let i = 0; i < len; i++){
            corrVal = this.selAttr.attrVals[i] + offset;
            if(this.selAttr.partNum == gConst.HTU21D_005_T){
                if(this.selAttr.valCorr.units == gConst.DEG_F){
                    corrVal = (corrVal * 9.0) / 5.0 + 32.0;
                }
            }
            this.lineChartData.datasets[0].data[i] = corrVal;
            //this.lineChartData.labels[i] = this.utils.secToTime(this.selAttr.timestamps[i] - start);
            this.lineChartData.labels[i] = this.utils.secToTime(end - this.selAttr.timestamps[i]);
            if(corrVal > maxVal){
                maxVal = corrVal;
            }
            if(corrVal < minVal){
                minVal = corrVal;
            }
        }
        const timeSpan = this.selAttr.timestamps[len - 1] - this.selAttr.timestamps[0];
        this.duration = `${this.utils.secToTime(timeSpan)}`;

        let step = 1;
        let max = Math.ceil(maxVal);
        if((max - maxVal) < 0.1){
            max++;
        }
        let min = max;
        while(min >= minVal){
            min--;
        }
        if(maxVal > minVal){
            step = Math.ceil((maxVal - minVal) / 4);
            max = Math.ceil(maxVal);
            if((max - maxVal) < 0.1){
                max += step;
            }
            min = max;
            while(min >= minVal){
                min -= step;
            }
        }
        const chartOpt = this.lineChartOptions as any;
        const chartData = this.lineChartData as any;

        chartOpt.scales.y.max = max;
        chartOpt.scales.y.min = min;
        chartOpt.scales.y.ticks.stepSize = step;

        switch(this.selAttr.partNum){
            case gConst.SI7021_027_T:
            case gConst.SHT40_018_T:
            case gConst.HTU21D_005_T: {
                chartData.datasets[0].tension = 0.2;
                chartData.datasets[0].borderColor = 'red';
                let unit = 'degC';
                if(this.selAttr.valCorr.units == gConst.DEG_F){
                    unit = 'degF';
                }
                chartOpt.plugins.tooltip.callbacks = {
                    title: (tooltipItem: any) => {
                        return tooltipItem[0].label;
                    },
                    label: (tooltipItem: any) => {
                        const yVal = tooltipItem.dataset.data[tooltipItem.dataIndex];
                        var tooltipText = '';
                        if(yVal != null) {
                            tooltipText = `${yVal.toFixed(1)} ${unit}`;
                        }
                        return tooltipText;
                    }
                }
                break;
            }
            case gConst.SI7021_027_RH:
            case gConst.SHT40_018_RH:
            case gConst.HTU21D_005_RH: {
                chartData.datasets[0].tension = 0.2;
                chartData.datasets[0].borderColor = 'green';
                chartOpt.plugins.tooltip.callbacks = {
                    title: (tooltipItem: any) => {
                        return tooltipItem[0].label;
                    },
                    label: (tooltipItem: any) => {
                        const yVal = tooltipItem.dataset.data[tooltipItem.dataIndex];
                        var tooltipText = '';
                        if(yVal != null) {
                            tooltipText = `${yVal.toFixed(0)} %rh`;
                        }
                        return tooltipText;
                    }
                }
                break;
            }
            case gConst.ENS_015_AQ: {
                chartOpt.scales.y.max = 5;
                chartOpt.scales.y.min = 1;
                chartOpt.scales.y.ticks.stepSize = 1;
                chartData.datasets[0].borderColor = 'green';
                chartOpt.plugins.tooltip.callbacks = {
                    title: (tooltipItem: any) => {
                        return tooltipItem[0].label;
                    },
                    label: (tooltipItem: any) => {
                        const yVal = tooltipItem.dataset.data[tooltipItem.dataIndex];
                        var tooltipText = '';
                        if(yVal != null) {
                            tooltipText = `aq - ${yVal.toFixed(0)}`;
                        }
                        return tooltipText;
                    }
                }
                break;
            }
            case gConst.SSR_009_RELAY: {
                chartOpt.scales.y.max = 1;
                chartOpt.scales.y.min = 0;
                chartOpt.scales.y.ticks.stepSize = 1;
                chartData.datasets[0].borderColor = 'black';
                chartOpt.plugins.tooltip.callbacks = {
                    title: (tooltipItem: any) => {
                        return tooltipItem[0].label;
                    },
                    label: (tooltipItem: any) => {
                        const yVal = tooltipItem.dataset.data[tooltipItem.dataIndex];
                        let tooltipText = 'off';
                        if(yVal != null) {
                            if(yVal == 1){
                                tooltipText = 'on';
                            }
                        }
                        return tooltipText;
                    }
                }
                break;
            }
        }

        setTimeout(() => {
            this.chart!.update();
        }, 100);

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
     * fn          onChartClick
     *
     * brief
     *
     */
    onChartClick(event: any) {

        console.log(event);

        if(event.active.length){
            this.selIdx = event.active[0].index;
            const time = this.lineChartData.labels![this.selIdx];
            const value: any = this.lineChartData.datasets[0].data[this.selIdx];
            this.selTime = `time: ${time}`;
            this.selValue = `value: ${value.toFixed(1)}`;
        }
        else {
            this.selIdx = -1;
            this.selTime = noTime;
            this.selValue = noValue;
        }
    }

    /***********************************************************************************************
     * fn          delSelPoint
     *
     * brief
     *
     */
    delSelPoint() {

        if(this.selIdx < 0){
            return;
        }
        this.selAttr.attrVals.splice(this.selIdx, 1);
        this.selAttr.timestamps.splice(this.selIdx, 1);
        this.selIdx = -1;
        this.selTime = noTime;
        this.selValue = noValue;

        this.setChartData();
    }

    /***********************************************************************************************
     * fn          newData
     *
     * brief
     *
     */
    newData(attr: gIF.hostedAttr_t) {

        console.log(`new attr: ${attr}`);

        if(attr.extAddr == this.selAttr.extAddr){
            if(attr.endPoint == this.selAttr.endPoint){
                if(attr.clusterID == this.selAttr.clusterID){
                    this.selIdx = -1;
                    this.selTime = noTime;
                    this.selValue = noValue;

                    this.setChartData();
                }
            }
        }
    }

}
