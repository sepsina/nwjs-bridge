import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';
import { Subject, filter, fromEvent, takeUntil } from 'rxjs';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    imports: [
        CommonModule
    ],
    standalone: true,
})
export class ModalComponent implements  OnInit, AfterViewInit {

    private unsubscribe$ = new Subject<void>();

    constructor(private modal: ModalService) {
        // ---
    }

    ngAfterViewInit() {
        // ---
    }

    ngOnInit() {
        this.listenToEscapeKey();

    }

    /***********************************************************************************************
     * @fn          listenToEscapeKey
     *
     * @brief
     *
     */
    listenToEscapeKey() {
        fromEvent(document, 'keyup')
        .pipe(
            filter((event: any) => event.code === 'Escape'),
            takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
            this.close();
        });
    }

    /***********************************************************************************************
     * @fn          close
     *
     * @brief
     *
     */
    close() {

        this.unsubscribe$.next();
        this.unsubscribe$.complete();

        this.modal.closeDlg();
    }

}
