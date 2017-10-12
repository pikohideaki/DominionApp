import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-set-memo-dialog',
  template: `
    <div mat-dialog-content>
      <mat-form-field>
        <textarea matInput placeholder="Memo"
          [value]="newMemo || ''"
          (input)="changeMemo( $event.target.value )" >
        </textarea>
      </mat-form-field>
    </div>
    <div mat-dialog-actions class='actionButtons'>
      <span class="margined-element">
        <button mat-raised-button
            [mat-dialog-close]="newMemo"
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
export class SetMemoDialogComponent implements OnInit {

  @Input()  uid: string;
  @Input()  memo: string;

  newMemo: string = '';


  constructor() { }

  ngOnInit() {
    this.newMemo = this.memo;
  }

  changeMemo( value ) {
    this.newMemo = value;
  }

}