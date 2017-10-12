import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-waiting-spinner',
  template: `<mat-spinner *ngIf="!done" strokeWidth="6" diameter="48" ></mat-spinner>`,
  styles: [],
})
export class WaitingSpinnerComponent implements OnInit {

  @Input() done: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
