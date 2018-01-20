import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';

import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { User } from '../../classes/user';

@Component({
  selector: 'app-my-name-selector',
  template: `
    <mat-form-field class="margin20">
      <mat-select
          placeholder="自分の名前を選択"
          [value]="myName"
          (change)="changeMyName( $event.value )"
          required>
        <mat-option *ngFor="let name of userNames$ | async" [value]="name">
          {{ name }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [],
})
export class MyNameSelectorComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  userNames$: Observable<string[]>;

  @Input() myName: string;
  @Output() myNameChange = new EventEmitter<string>();

  constructor(
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService,
  ) {
    this.userNames$ = this.database.users$.map( users => users.map( e => e.name ) );

    this.myUserInfo.name$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.myName = val;
        this.myNameChange.emit( val );
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  changeMyName( myName: string ) {
    this.myUserInfo.setMyName( myName );
    this.myNameChange.emit( myName );
  }

}
