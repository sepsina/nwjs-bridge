import {
    Component,
    inject,
    ChangeDetectionStrategy
} from '@angular/core';

import {
    DialogRef,
    DIALOG_DATA
} from '@angular/cdk/dialog';

import { StorageService } from '../services/storage.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

import * as gConst from '../gConst';
import * as gIF from '../gIF'

const OFF = 0;
const ON = 1;
const TOGGLE = 2;

@Component({
    selector: 'app-ssr',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CdkDrag,
        CdkDragHandle
    ],
    templateUrl: './ssr.html',
    styleUrls: ['./ssr.scss'],
    host: {
        '[attr.id]': 'hostID',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SSR  {

    hostID = 'ssr-dlg';

    selAttr: gIF.hostedAttr_t;

    storage = inject(StorageService);
    dialogRef = inject(DialogRef);
    dlgData = inject(DIALOG_DATA);

    constructor() {
        this.selAttr = this.dlgData.attr;
    }

    /***********************************************************************************************
     * @fn          close
     *
     * @brief
     *
     */
    close() {
        this.dialogRef.close();
    }

    /***********************************************************************************************
     * @fn          setActuatorOn
     *
     * @brief
     *
     */
    setActuatorOn(){
        this.setActuator(ON);
    }

    /***********************************************************************************************
     * @fn          setActuatorOff
     *
     * @brief
     *
     */
    setActuatorOff(){
        this.setActuator(OFF);
    }

    /***********************************************************************************************
     * @fn          toggleActuator
     *
     * @brief
     *
     */
    toggleActuator(){
        this.setActuator(TOGGLE);
    }

    /***********************************************************************************************
     * @fn          setActuator
     *
     * @brief
     *
     */
    setActuator(state: number){
        const zclCmd = {} as gIF.udpZclReq_t;
        zclCmd.ip = '';
        zclCmd.port = 0;
        zclCmd.extAddr = this.selAttr.extAddr;
        zclCmd.endPoint = this.selAttr.endPoint;
        zclCmd.clusterID = gConst.CLUSTER_ID_GEN_ON_OFF;
        zclCmd.hasRsp = 0;
        zclCmd.cmdLen = 3;
        zclCmd.cmd = [];
        zclCmd.cmd[0] = 0x11; // cluster spec cmd, not manu spec, client to srv dir, disable dflt rsp
        zclCmd.cmd[1] = 0x00; // seq num -> not used
        zclCmd.cmd[2] = state;  // ON/OFF command
        //this.serialLink.udpZclCmd(JSON.stringify(zclCmd));
        this.storage.zclCmd.set(zclCmd);
    }

}
