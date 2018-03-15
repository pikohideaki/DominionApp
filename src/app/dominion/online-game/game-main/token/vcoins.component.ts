import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { utils } from '../../../../my-own-library/utilities';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-vcoins',
  template: `
    <ng-container *ngIf="{
          number: number$ | async,
          indice: indice$ | async
        } as data">
      <div class="vcoins" *ngIf="data.number > 0">
        <ng-container  *ngFor="let _ of data.indice">
          <app-vcoin class="vcoin" [diameter]="diameter"
            [isButton]="isButton" (onClick)="clicked()">
          </app-vcoin>
        </ng-container>
      </div>
    </ng-container>
  `,
  styles: [`
    .vcoins {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      padding: 3px;
    }
    .vcoin {
      padding: 2px;
    }
  `]
})
export class VcoinsComponent implements OnInit {

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
