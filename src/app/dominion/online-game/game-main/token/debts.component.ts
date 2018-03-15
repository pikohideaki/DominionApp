import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { utils } from '../../../../my-own-library/utilities';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-debts',
  template: `
    <ng-container *ngIf="{
          number: number$ | async,
          indice: indice$ | async
        } as data">
      <div class="debts" *ngIf="data.number > 0">
        <ng-container  *ngFor="let _ of data.indice">
          <app-debt class="debt" [diameter]="diameter"
            [isButton]="isButton" (onClick)="clicked()">
          </app-debt>
        </ng-container>
      </div>
    </ng-container>
  `,
  styles: [`
    .debts {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      padding: 3px;
    }
    .debt {
      padding: 2px;
    }
  `]
})
export class DebtsComponent implements OnInit {

  @Input() diameter: number = 24;
  @Input() number$: Observable<number>;
  @Input() isButton: boolean = false;
  @Output() onClick = new EventEmitter<void>();

  indice$: Observable<number[]>;


  constructor(
  ) { }

  ngOnInit() {
    this.indice$ = this.number$.map( n => utils.number.seq0(n) );
  }

  clicked() {
    if ( this.isButton ) this.onClick.emit();
  }
}
