import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-set-vp-dialog',
  template: `
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput type="number"
          onclick="this.select(0, this.value.length)"
          [value]="newVP"
          (input)="changeVP( $event.target.value )" >
      </mat-form-field>
    </div>
    <div mat-dialog-actions class='actionButtons'>
      <span class="margined-element">
        <button mat-raised-button
            [mat-dialog-close]="newVP"
            color='primary'>
          OK
        </button>
      </span>
      <span class="margined-element">
        <button mat-raised-button
            mat-dialog-close="">
          Cancel
        </button>
      </span>
    </div>
  `,
  styles: []
})
export class SetVpDialogComponent implements OnInit {

  @Input()  uid: string;
  @Input()  VP: number;

  newVP: number = 0;


  constructor() { }

  ngOnInit() {
    this.newVP = this.VP;
  }

  changeVP( value ) {
    this.newVP = value;
  }

}
