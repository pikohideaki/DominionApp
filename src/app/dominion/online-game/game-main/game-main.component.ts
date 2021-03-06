import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';


import { MessageDialogComponent } from '../../../my-own-library/message-dialog.component';
import { OnlineGameResultDialogComponent } from './dialogs/online-game-result-dialog/online-game-result-dialog.component';

import { UserService } from '../../../firebase-mediator/user.service';
import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyGameRoomService } from './services/my-game-room.service';

import { GameRoomCommunicationService } from './services/game-room-communication.service';
import { GameMessageService           } from './services/game-message.service';
import { SubmitGameResultService      } from './services/submit-game-result.service';
import { GameStateService             } from './services/game-state-services/game-state.service';
import { TransitStateService          } from './services/game-state-services/transit-state.service';

import { ValuesForViewService } from './services/values-for-view.service';
import { DCard } from '../../../classes/online-game/dcard';




@Component({
  providers: [
    MyGameRoomService,
    GameStateService,
    GameRoomCommunicationService,
    TransitStateService,
    GameMessageService,
    SubmitGameResultService,
    ValuesForViewService,
  ],
  selector: 'app-game-main',
  templateUrl: './game-main.component.html',
  styleUrls: ['./game-main.component.css'],
})
export class GameMainComponent implements OnInit, OnDestroy {
  private alive = true;

  gameMessageList$         = this.gameMessage.gameMessageList$;
  gameMessageListSliced$   = this.gameMessage.gameMessageListSliced$;
  gameMessageIndexDelayed$ = this.gameMessage.gameMessageIndexDelayed$;
  myIndex$                 = this.myGameRoomService.myIndex$;
  isMyTurn$                = this.gameStateService.isMyTurn$;
  gameIsOver$              = this.gameStateService.gameIsOver$;
  gameResult$              = this.submitGameResultService.gameResult$;

  private initialStateIsReadySource = new BehaviorSubject<boolean>( false );
  initialStateIsReady$
    = this.initialStateIsReadySource.asObservable().distinctUntilChanged();

  private userInputSubscription: Subscription;

  // view config
  chatOpened$ = this.user.onlineGame.chatOpened$;
  autoSort$   = this.user.onlineGame.autoSort$;
  private showCardPropertySource = new BehaviorSubject<boolean>(false);
  showCardProperty$ = this.showCardPropertySource.asObservable();
  gainCardState$: Observable<boolean> = this.valuesForView.gainCardState$;


  // left sidebar
  private autoScrollSource = new BehaviorSubject<boolean>(true);
  autoScroll$ = this.autoScrollSource.asObservable();
  isBuyPlayPhase$ = this.gameStateService.phase$.map( e => e === 'BuyPlay' );
  myThinkingState$
    = Observable.combineLatest(
          this.gameRoomCommunication.thinkingState$,
          this.myIndex$,
          (list, myIndex) => list[ myIndex ] );

  private logSnapshotSource = new BehaviorSubject<void>(null);  // debug

  loading$ = this.transitStateService.loadingInitialUserInputList$;


  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private user: UserService,
    private database: FireDatabaseService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameRoomCommunication: GameRoomCommunicationService,
    private gameMessage: GameMessageService,
    private transitStateService: TransitStateService,
    private submitGameResultService: SubmitGameResultService,
    private valuesForView: ValuesForViewService,
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
        this.gameResult$,
        this.loading$ )
      .takeWhile( () => this.alive )
      .subscribe( ([[name, gameIsOver], myIndex, gameState, isSubmitted, gameResult, loading]) => {
        if ( !gameIsOver ) {
          if ( !loading ) this.showChangeTurnMessage( name );
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
            this.initialStateIsReady$,
            this.gameStateService.gameState$ )
      .takeWhile( () => this.alive )
      .subscribe( ([_, myIndex, turnPlayerIndex, initialStateIsReady, gameState]) =>
          console.log(
              `myIndex = ${myIndex}`,
              `turnPlayerIndex = ${turnPlayerIndex}`,
              `initialStateIsReady = ${initialStateIsReady}`,
              gameState
            ) );
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
          .subscribe( ([[userInput, currState], myIndex, playersNameList]) =>
            this.transitStateService.transitState(
                userInput,
                currState,
                myIndex,
                playersNameList ) );

    const initialState = await this.myGameRoomService.initialState$.first().toPromise();
    this.gameStateService.setGameState( initialState );
    this.transitStateService.setNextGameState( initialState );

    this.initialStateIsReadySource.next( true );
  }


 // left sidebar
  async toggleSideNav( sidenav ) {
    this.user.setOnlineGameChatOpened( (await sidenav.toggle()).type === 'open' );
  }

  autoScrollChange( value: boolean ) {
    this.autoScrollSource.next( value );
  }

  toggleShowCardPropertyButtons() {
    this.showCardPropertySource.next( !this.showCardPropertySource.getValue() );
  }

  logSnapshot() {  // developer mode only
    this.logSnapshotSource.next(null);
  }

  initialStateIsReadyChange( value: boolean ) {
    this.initialStateIsReadySource.next( value );
  }



  // ゲーム操作
  onCardClick(
    myIndex: number,
    dcard: DCard,
    autoSort: boolean,
  ) {
    this.gameRoomCommunication.sendUserInput(
        'clicked card', myIndex, autoSort, dcard.id );
  }

  onVcoinClick( myIndex: number, autoSort: boolean ) {
    this.gameRoomCommunication.sendUserInput(
        'clicked vcoin', myIndex, autoSort );
  }

  onDebtClick( myIndex: number, autoSort: boolean ) {
    this.gameRoomCommunication.sendUserInput(
        'clicked debt', myIndex, autoSort );
  }

  private async showChangeTurnMessage( name: string ) {
    // const dialogRef = this.dialog.open( MessageDialogComponent );
    // dialogRef.componentInstance.message = `${name}のターン`;
    // await this.utils.sleep(1);
    // dialogRef.close();
    this.openSnackBar(`${name}のターン`);
  }

  showGameResultDialog() {
    const dialogRef = this.dialog.open( OnlineGameResultDialogComponent );
    dialogRef.componentInstance.gameResult$ = this.gameResult$;
    dialogRef.componentInstance.cardPropertyList$ = this.database.cardPropertyList$;
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }

}
