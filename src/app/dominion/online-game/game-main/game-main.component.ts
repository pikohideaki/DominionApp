import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CardProperty } from '../../../classes/card-property';
import { DCard, GameState, PlayerCards } from '../../../classes/game-state';

import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyGameRoomService } from './my-game-room.service';
import { GameRoomCommunicationService } from './game-room-communication.service';
import { GameMessageService } from './game-message.service';

// game-state-services
import { GameStateService         } from './game-state-services/game-state.service';
import { GameStateShortcutService } from './game-state-services/game-state-shortcut.service';
import { GameLoopService          } from './game-state-services/game-loop.service';
import { TransitStateService      } from './game-state-services/transit-state.service';

import { GameConfigDialogComponent } from './game-config/game-config.component';
import { OnlineGameResultDialogComponent } from './online-game-result-dialog/online-game-result-dialog.component';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../my-own-library/confirm-dialog.component';
import { FullScreenService } from '../../../my-own-library/full-screen.service';
import { UserInput } from '../../../classes/game-room-communication';
import { Subscription } from 'rxjs/Subscription';

import { MessageDialogComponent } from '../../../my-own-library/message-dialog.component';
import { OnlineGamePlayerCardsDialogComponent } from './online-game-result-player-cards/online-game-result-player-cards.component';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { GameConfigService } from './game-config.service';
import { VictoryPointsCalculatorService } from '../../sub-components/victory-points-calculator/victory-points-calculator.service';
import { SubmitGameResultService } from './submit-game-result.service';


@Component({
  providers: [
    MyGameRoomService,
    GameStateService,
    GameRoomCommunicationService,
    GameStateShortcutService,
    TransitStateService,
    GameLoopService,
    GameMessageService,
    VictoryPointsCalculatorService,
    SubmitGameResultService,
  ],
  selector: 'app-game-main',
  templateUrl: './game-main.component.html',
  styleUrls: ['./game-main.component.css']
})
export class GameMainComponent implements OnInit, OnDestroy {
  private alive = true;

  chatOpened$ = this.myUserInfo.onlineGame.chatOpened$;
  autoScroll: boolean = true;
  cardSizeRatio$ = this.myUserInfo.onlineGame.cardSizeRatio$;
  isFullscreen$ = this.fullscreen.isFullscreen$;

  private initialStateIsReadySource = new BehaviorSubject<boolean>( false );
  initialStateIsReady$
    = this.initialStateIsReadySource.asObservable().distinctUntilChanged();

  myIndex$ = this.myGameRoomService.myIndex$;
  isMyTurn$ = this.gameStateService.isMyTurn$;
  messageForMe$ = this.gameMessage.messageForMe$;
  gameIsOver$ = this.gameStateService.gameIsOver$;
  isBuyPlayPhase$ = this.gameStateService.phase$.map( e => e === 'BuyPlay' );

  private showCardPropertySource = new BehaviorSubject<boolean>(false);
  showCardProperty$ = this.showCardPropertySource.asObservable();

  private userInputSubscription: Subscription;

  myThinkingState$
    = Observable.combineLatest(
          this.gameRoomCommunication.thinkingState$,
          this.myIndex$,
          (list, myIndex) => list[ myIndex ] );

  private gameResult$
    = this.submitGameResultService.gameResult$;

  // debug
  private logSnapshotSource = new BehaviorSubject<void>(null);
  devMode$ = this.config.devMode$;


  constructor(
    private dialog: MatDialog,
    private utils: UtilitiesService,
    private myUserInfo: MyUserInfoService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameRoomCommunication: GameRoomCommunicationService,
    private gameMessage: GameMessageService,
    private transitStateService: TransitStateService,
    private router: Router,
    private fullscreen: FullScreenService,
    private config: GameConfigService,
    private submitGameResultService: SubmitGameResultService,
  ) {
    this.startProcessing();

    Observable.combineLatest(
          this.transitStateService.userInput$,
          this.myIndex$ )
        .withLatestFrom( this.gameRoomCommunication.thinkingState$ )
      .takeWhile( () => this.alive )
      .subscribe( ([[userInput, myIndex], thinkingState]) => {
        if ( userInput.data.playerId === myIndex
            && thinkingState[ myIndex ] === true ) {
          this.gameRoomCommunication.setThinkingState( myIndex, false );
        }
      });

    this.gameRoomCommunication.resetGameClicked$.skip(1)
      .takeWhile( () => this.alive )
      .subscribe( _ => this.startProcessing() );  // reset game

    Observable.combineLatest(
        this.gameStateService.turnPlayersName$,
        this.gameIsOver$ )
      .withLatestFrom(
        this.myGameRoomService.myIndex$,
        this.gameStateService.gameState$,
        this.gameRoomCommunication.resultIsSubmitted$,
        this.gameResult$ )
      .takeWhile( () => this.alive )
      .subscribe( ([[name, gameIsOver], myIndex, gameState, isSubmitted, gameResult]) => {
        if ( !gameIsOver ) {
          this.showChangeTurnDialog( name );
        } else {
          // ゲーム終了処理
          gameState.disableAllButtons();
          this.gameStateService.setGameState( gameState );
          this.showGameResultDialog();
          if ( myIndex === 0 && !isSubmitted ) {
            this.gameRoomCommunication.setResultSubmittedState( true )
            .then( () => this.submitGameResultService.submitGameResult( gameResult ) );
          }
        }
      });

    this.logSnapshotSource.asObservable().skip(1)
        .withLatestFrom(
            this.myGameRoomService.myIndex$,
            this.gameStateService.turnPlayerIndex$,
            this.gameStateService.gameState$,
            this.initialStateIsReady$ )
      .subscribe( ([_, ...data]) => console.log(...data) );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }



  private async startProcessing() {
    if ( this.userInputSubscription !== undefined ) {
      this.userInputSubscription.unsubscribe();
    }

    // 命令列の取得・適用を開始
    this.userInputSubscription
      = this.transitStateService.gameData$
          .takeWhile( () => this.alive )
          .subscribe( ([[userInput, currState], Prosperity]) =>
            this.transitStateService.transitState( userInput, currState, Prosperity ) );

    const initialState = await this.myGameRoomService.initialState$.first().toPromise();
    this.gameStateService.setGameState( initialState );
    this.transitStateService.setNextGameState( initialState );

    this.initialStateIsReadySource.next( true );
  }



  // dialogs
  private async showChangeTurnDialog( name: string ) {
    const dialogRef = this.dialog.open( MessageDialogComponent );
    dialogRef.componentInstance.message = `${name}のターン`;
    await this.utils.sleep(1);
    dialogRef.close();
  }


 // left side-bar
  async toggleSideNav( sidenav ) {
    this.myUserInfo.setOnlineGameChatOpened( (await sidenav.toggle()).type === 'open' );
  }

  toggleAutoScroll( value: boolean ) {
    this.autoScroll = value;
  }

  toggleShowCardPropertyButtons() {
    this.showCardPropertySource.next( !this.showCardPropertySource.getValue() );
  }

  toggleMyThinkingState( currentState: boolean, myIndex: number ) {
    this.gameRoomCommunication.setThinkingState( myIndex, !currentState );
  }


  // ゲーム操作
  onCardClick( myIndex: number, dcard: DCard ) {
    this.gameRoomCommunication.sendUserInput('clicked card', myIndex, dcard.id );
  }

  goToNextPhase( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('clicked goToNextPhase', myIndex );
  }

  finishMyTurn( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('clicked finishMyTurn', myIndex );
  }

  sortMyHandCards( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('clicked sortHandcards', myIndex );
  }

  playAllTreasures( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('play all treasures', myIndex );
  }


  // 設定
  async settings() {
    const dialogRef = this.dialog.open( GameConfigDialogComponent );
    const result = await dialogRef.afterClosed().toPromise();
    if ( result === 'terminateGame' ) {
      this.gameRoomCommunication.setTerminatedState( true );
    }
    if ( result === 'resetGame' ) {
      this.gameRoomCommunication.setTerminatedState( false );
      this.initialStateIsReadySource.next( false );
      await this.gameRoomCommunication.removeAllUserInput();
      // 最初のプレイヤーの自動でgoToNextPhaseを1回発動
      await this.gameRoomCommunication.sendUserInput('clicked goToNextPhase', 0 );
    }
  }


  // right side-bar
  showGameResultDialog() {
    const dialogRef = this.dialog.open( OnlineGameResultDialogComponent );
    dialogRef.componentInstance.gameResult$ = this.gameResult$;
  }

  showPlayerCards() {
    const dialogRef = this.dialog.open( OnlineGamePlayerCardsDialogComponent );
    dialogRef.componentInstance.allPlayersCards$ = this.gameStateService.allPlayersCards$;
    dialogRef.componentInstance.playersName$ = this.myGameRoomService.playersNameShuffled$;
  }

  exit() {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message
      = '退室しますか？（退室しても新しいゲームを始めるまではこの画面に戻ることができます。）';
    dialogRef.afterClosed().subscribe( yn => {
      if ( yn === 'yes' ) this.router.navigate( ['/online-game'] );
    });
  }



  // developper moder
  incrementTurnCounter( myIndex ) {
    this.gameRoomCommunication.sendUserInput('increment turnCounter', myIndex );
  }

  logSnapshot() {
    this.logSnapshotSource.next(null);
  }

  userInputLog() {
    const dialogRef = this.dialog.open( UserInputLogDialogComponent );
    dialogRef.componentInstance.gameState$
      = this.gameStateService.gameState$;
    dialogRef.componentInstance.playersNameShuffled$
      = this.myGameRoomService.playersNameShuffled$;
    dialogRef.componentInstance.userInputList$
      = this.gameRoomCommunication.userInputList$;
  }

}



@Component({
  selector: 'app-user-input-log-dialog',
  template: `
    <div mat-dialog-title>
      ログ
    </div>
    <div mat-dialog-content>
      <div *ngIf="(userInputLog$ | async) as userInputLog">
        <div *ngFor="let userInput of userInputLog">
          {{userInput.playerName}},
          "{{userInput.command}}",
          {{userInput.clickedCardName}} (id = {{userInput.clickedCardId}});
        </div>
      </div>
    </div>
    <div mat-dialog-actions class="center">
      <button mat-raised-button mat-dialog-close="" color='primary'>
        OK
      </button>
    </div>
  `,
  styles: [` .center { justify-content: center; } `]
})
export class UserInputLogDialogComponent implements OnInit {
  userInputList$: Observable<UserInput[]>;
  playersNameShuffled$: Observable<string[]>;
  gameState$: Observable<GameState>;

  userInputLog$;

  constructor(
  ) { }

  ngOnInit() {
    this.userInputLog$
      = Observable.combineLatest(
            this.userInputList$,
            this.playersNameShuffled$,
            this.gameState$,
            (userInputList, playerNames, gameState) =>
              userInputList.map( userInput => ({
                playerName:      playerNames[ userInput.data.playerId ],
                command:         userInput.command,
                clickedCardId:   userInput.data.clickedCardId,
                clickedCardName: gameState.getDCard( userInput.data.clickedCardId ).cardProperty.nameJp,
              }))
          );
  }
}
