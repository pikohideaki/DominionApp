import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-table--reset-buttons',
  template: `<button class='resetButton' mat-raised-button (click)="clicked()">Reset All</button>`,
  styles: [`.resetButton { float: right; margin: 5px; } `],
})
export class ResetButtonComponent implements OnInit {

  @Output() click = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  clicked() {
    this.click.emit();
  }

  resetSelector( columnSettings: any[], columnName?: string ): void {
    if ( columnName !== undefined ) {
      columnSettings = columnSettings.filter( column => column.name === columnName );
    }
    columnSettings.forEach( e => e.manipState = undefined );
  }

}

