import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MyUserInfoService } from '../../../../../firebase-mediator/my-user-info.service';
import { PlayerCards } from '../../../../../classes/online-game/player-cards';
import { DCard } from '../../../../../classes/online-game/dcard';


@Component({
  selector: 'app-online-game-result-player-cards-dialog',
  templateUrl: './online-game-result-player-cards-dialog.component.html',
  styleUrls: ['./online-game-result-player-cards-dialog.component.css']
})
export class OnlineGamePlayerCardsDialogComponent implements OnInit {

  allPlayersCards$: Observable<PlayerCards[]>;  // input
  playersNameList$: Observable<string[]>;  // input


  constructor( ) { }

  ngOnInit() {
  }
}



@Component({
  selector: 'app-each-player-cards',
  template: `
    <ng-container *ngIf="{
          cardSizeRatio: cardSizeRatio$      | async,
          dcards:        playerCardsForView$ | async
        } as data">
      <div *ngIf="data.cardSizeRatio && data.dcards">
        <div> {{name}} </div>
        <div>
          <ng-container *ngFor="let DCard of data.dcards">
            <app-dominion-card-image
              [card]="DCard.cardProperty"
              [width]="50 * data.cardSizeRatio"
              [faceUp]="true"
              [isButton]="false">
            </app-dominion-card-image>
          </ng-container>
        </div>
      </div>
    </ng-container>
`
})
export class EachPlayerCardsComponent implements OnInit {

  @Input() name: string;  // input
  @Input() playerIndex: number; // input
  @Input() allPlayersCards$: Observable<PlayerCards[]>;  // input

  cardSizeRatio$ = this.myUserInfo.onlineGame.cardSizeRatio$;

  playerCardsForView$: Observable<DCard[]>;


  constructor(
    private myUserInfo: MyUserInfoService
  ) { }

  ngOnInit() {
    this.playerCardsForView$
      = this.allPlayersCards$
          .filter( e => e.length > this.playerIndex )
          .map( allPlayersCards =>
                allPlayersCards[ this.playerIndex ].getDCards( null, true ) );
  }
}
