import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';


@Component({
  providers: [],
  selector: 'app-online-game',
  template: `
    <div *ngIf="!(signedIn$ | async); then thenBlock; else elseBlock" ></div>
    <ng-template #thenBlock>ログインしてください。</ng-template>
    <ng-template #elseBlock>
      <mat-tab-group>
        <mat-tab label="New Game">
          <app-add-game-group></app-add-game-group>
        </mat-tab>
        <mat-tab label="Game Rooms">
          <app-game-room-list></app-game-room-list>
        </mat-tab>
      </mat-tab-group>
    </ng-template>
  `,
  styles: []
})
export class OnlineGameComponent implements OnInit {
  signedIn$: Observable<boolean> = this.myUserInfo.signedIn$;

  constructor(
    private myUserInfo: MyUserInfoService
  ) {
  }

  ngOnInit() {
  }
}
