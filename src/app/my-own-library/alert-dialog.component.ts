import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alert-dialog',
  template: `
    <!-- message -->
    <div mat-dialog-content>
      {{message}}
    </div>

    <!-- buttons -->
    <div mat-dialog-actions class="actionButtons">
      <span class="margined-element">
        <button mat-raised-button
          mat-dialog-close="yes"
          color='primary'>
          OK
        </button>
      </span>
    </div>
  `,
  styles: [` .actionButtons { justify-content: center; } `]
})
export class AlertDialogComponent implements OnInit {

  @Input() message: string;

  constructor() {}

  ngOnInit() {
  }

}
