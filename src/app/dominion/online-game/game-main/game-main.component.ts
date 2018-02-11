import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyGameRoomService } from './my-game-room.service';
import { GameStateService } from './game-state.service';
import { GameRoomCommunicationService } from './game-room-communication.service';

import { CardProperty } from '../../../classes/card-property';
import { DCard, GameState } from '../../../classes/game-state';
import { GameStateShortcutService } from './game-state-shortcut.service';
import { GameLoopService } from './game-loop.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
  providers: [
    MyGameRoomService,
    GameStateService,
    GameRoomCommunicationService,
    GameStateShortcutService,
    GameLoopService
  ],
  selector: 'app-game-main',
  templateUrl: './game-main.component.html',
  styleUrls: ['./game-main.component.css']
})
export class GameMainComponent implements OnInit {
  chatOpened$: Observable<boolean>
    = this.myUserInfo.onlineGame.chatOpened$;

  myIndex$ = this.myGameRoomService.myIndex$;

  isMyTurn$: Observable<boolean>
    = Observable.combineLatest(
        this.gameStateService.turnPlayerIndex$,
        this.myIndex$,
        (turnPlayerIndex, myIndex) => (turnPlayerIndex === myIndex) )
      .distinctUntilChanged()
      .startWith( false );

  gameSnapshot$ = this.gameStateService.gameSnapshot$;

  autoScroll: boolean = true;

  action: number = 0;

  private messageSource = new BehaviorSubject<string>('');
  message$: Observable<string> = this.messageSource.asObservable();

  initialStateIsReady$ = this.gameStateService.initialStateIsReady$;


  constructor(
    private myUserInfo: MyUserInfoService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameStateShortcut: GameStateShortcutService,
    private gameLoopService: GameLoopService
  ) {
  }

  ngOnInit() {
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
    // this.gameLoopService.clickedCardSource.next( card );
  }
  goToNextPhase( snapshot: GameState ) {
    this.gameStateShortcut.goToNextPhase( snapshot.turnInfo.phase );
  }

  goToNextPlayer()  { this.gameStateShortcut.goToNextPlayer();  }

  sortMyHandCards( snapshot: GameState, myIndex: number ) {
    this.gameStateShortcut.sortHandCards( snapshot, myIndex );
  }




  //////////////////////////////// test
  incrementTurnCounter() {
    this.gameStateService.sendins.incrementTurnCounter();
  }
  logSnapshot() {
    this.gameStateService.logSnapshotSource.next(null);
  }

  resetGame() {
    this.gameStateService.resetGame();
  }
  // emit() {
  //   this.gameLoopService.closingNotifierSource.next();
  // }
}
