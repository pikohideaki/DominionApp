import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/pairwise';

import { GameRoom         } from '../../../../../classes/online-game/game-room';
import { CardProperty     } from '../../../../../classes/card-property';

import { FireDatabaseService } from '../../../../../firebase-mediator/cloud-firestore-mediator.service';
import { utils } from '../../../../../my-own-library/utilities';
import { GameRoomCommunicationService } from '../game-room-communication.service';
import { MyGameRoomService } from '../my-game-room.service';
import { GameStateService } from './game-state.service';
import { GameState } from '../../../../../classes/online-game/game-state';
import { UserInput } from '../../../../../classes/online-game/user-input';
import { nextPhase, sortHandCards } from './shortcut';
import { DataForCardEffect } from './card-effect-definitions/data-for-card-effect';
import { GameMessageService } from '../game-message.service';
import { playAllTreasures, onVcoinClick, onDebtClick, onCardClick } from './on-click-methods';
import { ValuesForViewService } from '../values-for-view.service';
import { phaseAction } from './phase-action';


@Injectable()
export class TransitStateService {

  userInput$: Observable<UserInput>
    = this.gameCommunication.userInputList$.startWith([])
        .pairwise()
        .map( ([prev, curr]) => Observable.from( curr.slice( prev.length ) ) )
        .concatAll();

  private isMyTurn$ = this.gameStateService.isMyTurn$;

  private transitStateResultSource
    = new BehaviorSubject<GameState>( new GameState() );
  private transitStateResult$
    = this.transitStateResultSource.asObservable().skip(1);

  gameData$
    = Observable
        .zip(
          this.userInput$,
          this.transitStateResult$ )
        .withLatestFrom(
          this.myGameRoom.myIndex$,
          this.myGameRoom.playersNameShuffled$ );


  loadingInitialUserInputList$: Observable<boolean>
    = Observable.combineLatest(
        Observable.zip(
            this.userInput$.map( e => e.index ).startWith(-1),
            this.transitStateResult$,
            (index, _) => index )
          .startWith(-1),
        this.gameCommunication.userInputList$
          .map( list => list.length )
          .filter( e => e > 0 )
          .first(),
        (doneIndex, initialListLength) => doneIndex < initialListLength - 1 )
      .startWith( true )
      .debounceTime( 500 );


  constructor(
    private dialog: MatDialog,
    private myGameRoom: MyGameRoomService,
    private gameStateService: GameStateService,
    private messageService: GameMessageService,
    private database: FireDatabaseService,
    private gameCommunication: GameRoomCommunicationService,
    private valuesForView: ValuesForViewService,
  ) {
  }


  setNextGameState( gameState: GameState ) {
    this.transitStateResultSource.next( gameState );
  }


  async transitState(
    userInput:       UserInput,
    currState:       GameState,
    myIndex:         number,
    playersNameList: string[],
  ): Promise<void> {
    // 現在のゲーム状態をコピー
    const nextState = new GameState( utils.object.copy( currState ) );
    const pid = userInput.data.playerId;
    const data: DataForCardEffect = {
      shuffleBy       : userInput.data.shuffleBy,
      gameState       : nextState,
      gameStateSetter : (gst: GameState) => this.gameStateService.setGameState( gst ),
      playersNameList : playersNameList,
      messager        : (msg: string) => this.messageService.pushMessage( msg ),
    };

    // コマンドの処理
    switch ( userInput.command ) {
      case 'increment turnCounter':
        nextState.incrementTurnCounter();
        nextState.turnInfo.phase = '';
        break;

      case 'clicked goToNextPhase':
        nextState.turnInfo.phase = nextPhase( nextState.turnInfo.phase );
        break;

      case 'clicked finishMyTurn':
        if ( nextState.gameIsOverConditions() ) {
          nextState.turnInfo.phase = 'GameIsOver';
        } else {
          nextState.turnInfo.phase = 'CleanUp';
        }
        break;

      case 'clicked sortHandcards':
        sortHandCards( nextState, pid );
        break;

      case 'play all treasures':
        await playAllTreasures( pid, true, data );
        break;

      case 'clicked card':
        await onCardClick( userInput.data.clickedCardId, pid, data );
        break;

      case 'clicked vcoin':
        await onVcoinClick( pid, true, data );
        break;

      case 'clicked debt':
        await onDebtClick( pid, true, data );
        break;

      default:
        console.log(`There is no command named "${userInput.command}".`);
        break;
    }

    // フェーズごとの処理
    await phaseAction( data,
            (state: boolean) => this.valuesForView.setGainCardState( state ) );

    // 自動で手札をソート
    if ( userInput.data.autoSort ) sortHandCards( nextState, pid );

    this.gameStateService.setGameState( nextState );
    this.setNextGameState( nextState );
  }

}
