import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-table--items-per-page',
  template: `
    <mat-form-field class='itemsPerPage'>
      <mat-select placeholder="items per page" [value]="itemsPerPage">
        <mat-option *ngFor="let option of itemsPerPageOptions"
            [value]="option"
            (click)="setItemsPerPage( option )" >
          {{ option }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .itemsPerPage {
      padding: 20px;
      display: inline-block;
    }
  `]
})
export class ItemsPerPageComponent implements OnInit {

  @Input() itemsPerPageOptions: number[] = [];  // [ 25, 50, 100, 200 ];

  @Input()  itemsPerPage: number = 0;
  @Output() itemsPerPageChange = new EventEmitter<number>();

  @Input()  selectedPageIndex: number = 0;
  @Output() selectedPageIndexChange = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit() {
  }

  setItemsPerPage( value: number ): void {
    this.itemsPerPageChange.emit( value );
    this.selectedPageIndexChange.emit(0);
  }


}
