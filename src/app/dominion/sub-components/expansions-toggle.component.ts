import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';


@Component({
  selector: 'app-expansions-toggle',
  template: `
    <div *ngFor="let name of (expansionsNameList$ | async); let idx = index" >
      <mat-slide-toggle color="primary"
            [checked]="isSelectedExpansions[idx]"
            (change)="toggleExpansion( $event.checked, idx )">
        {{name}}
      </mat-slide-toggle>
    </div>
  `,
  styles: []
})
export class ExpansionsToggleComponent implements OnInit {
  expansionsNameList$ = this.database.expansionsNameList$;

  @Input()  isSelectedExpansions: boolean[] = [];
  @Output() isSelectedExpansionsPartEmitter
    = new EventEmitter<{ index: number, checked: boolean }>();


  constructor(
    private database: CloudFirestoreMediatorService,
  ) {
  }

  ngOnInit() {
  }

  toggleExpansion( checked: boolean, index: number ) {
    this.isSelectedExpansions[ index ] = checked;
    this.isSelectedExpansionsPartEmitter.emit({ checked: checked, index: index });
  }


}
