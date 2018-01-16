import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';


@Component({
  providers: [],
  selector: 'app-online-game',
  template: `
    <div *ngIf="!(signedIn$ | async)" >
      ログインしてください。
    </div>
    <div *ngIf="signedIn$ | async" >
      <mat-tab-group>
        <mat-tab label="New Game">
          <app-add-game-group></app-add-game-group>
        </mat-tab>
        <mat-tab label="Game Rooms">
          <!-- <app-game-room-list [myName]="myName"></app-game-room-list> -->
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: []
})
export class OnlineGameComponent implements OnInit {
  signedIn$: Observable<boolean>;

  constructor(
    private myUserInfo: MyUserInfoService
  ) {
    this.signedIn$ = this.myUserInfo.signedIn$;
  }

  ngOnInit() {
  }
}
