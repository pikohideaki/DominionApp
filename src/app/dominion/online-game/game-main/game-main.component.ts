import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyGameRoomService } from './my-game-room.service';
import { GameStateService } from './game-state.service';
import { GameRoomCommunicationService } from './game-room-communication.service';

import { CardProperty } from '../../../classes/card-property';
import { DCard } from '../../../classes/game-state';
import { GameStateShortcutService } from './game-state-shortcut.service';


@Component({
  providers: [
    MyGameRoomService,
    GameStateService,
    GameRoomCommunicationService,
  ],
  selector: 'app-game-main',
  templateUrl: './game-main.component.html',
  styleUrls: ['./game-main.component.css']
})
export class GameMainComponent implements OnInit {
  receiveDataDone$: Observable<boolean>;
  chatOpened$:      Observable<boolean>;
  isMyTurn$:        Observable<boolean>;
  autoScroll:       boolean = true;


  constructor(
    private myUserInfo: MyUserInfoService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameStateShortcut: GameStateShortcutService
  ) {
  }

  ngOnInit() {
    this.chatOpened$ = this.myUserInfo.onlineGame.chatOpened$;

    const myIndex$ = this.myGameRoomService.myIndex$;

    this.isMyTurn$ = Observable.combineLatest(
        this.gameStateService.turnPlayerIndex$,
        myIndex$,
        (turnPlayerIndex, myIndex) => (turnPlayerIndex === myIndex) )
      .distinctUntilChanged()
      .startWith( false );

    this.receiveDataDone$
      = Observable.combineLatest(
            this.myGameRoomService.myGameRoom$,
            myIndex$,
            () => true ).first().delay( new Date( Date.now() + 500 ) )
        .startWith(false);
  }

  async toggleSideNav( sidenav ) {
    this.myUserInfo.setOnlineGameChatOpened( (await sidenav.toggle()).type === 'open' );
  }

  toggleAutoScroll( value: boolean ) {
    this.autoScroll = value;
  }


  // ゲーム操作
  onCardClicked( card: DCard ) {
    this.gameStateShortcut.onCardClicked( card );
  }
  goToNextPhase()   { this.gameStateShortcut.goToNextPhase();   }
  goToNextPlayer()  { this.gameStateShortcut.goToNextPlayer();  }
  sortMyHandCards() { this.gameStateShortcut.sortMyHandCards(); }




  //////////////////////////////// test
  test_faceUpAllCards() {
    this.gameStateShortcut.test_faceUpAllCards();
  }
  test_faceDownAllCards() {
    this.gameStateShortcut.test_faceDownAllCards();
  }
  test_isButtonAllCards() {
    this.gameStateShortcut.test_isButtonAllCards();
  }
  test_isNotButtonAllCards() {
    this.gameStateShortcut.test_isNotButtonAllCards();
  }
}
