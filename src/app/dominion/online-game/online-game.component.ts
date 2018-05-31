import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../../firebase-mediator/user.service';


@Component({
  providers: [],
  selector: 'app-online-game',
  template: `
    <div *ngIf="(signedIn$ | async); then signedIn; else notSignedIn" ></div>
    <ng-template #notSignedIn>ログインしてください。</ng-template>
    <ng-template #signedIn>
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
  signedIn$: Observable<boolean> = this.user.signedIn$;

  constructor(
    private user: UserService
  ) {
  }

  ngOnInit() {
  }
}
