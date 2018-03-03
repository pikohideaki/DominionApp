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

import { CloudFirestoreMediatorService } from '../../../../../firebase-mediator/cloud-firestore-mediator.service';
import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { GameStateShortcutService } from './game-state-shortcut.service';
import { GameLoopService } from './game-loop.service';
import { GameRoomCommunicationService } from '../game-room-communication.service';
import { MyGameRoomService } from '../my-game-room.service';
import { GameStateService } from './game-state.service';
import { GameState } from '../../../../../classes/online-game/game-state';
import { UserInput } from '../../../../../classes/online-game/user-input';


@Injectable()
export class TransitStateService {

  userInput$: Observable<UserInput>
    = this.gameCommunication.userInputList$.startWith([])
        .pairwise()
        .map( ([prev, curr]) => Observable.from( curr.slice( prev.length ) ) )
        .concatAll();

  private isMyTurn$ = this.gameState.isMyTurn$;

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
    private utils: UtilitiesService,
    private myGameRoom: MyGameRoomService,
    private gameState: GameStateService,
    private shortcut: GameStateShortcutService,
    private gameloop: GameLoopService,
    private database: CloudFirestoreMediatorService,
    private gameCommunication: GameRoomCommunicationService,
  ) {
    // this.userInput$.subscribe( val => console.log( 'userInput$', val ) );
    // this.transitStateResult$.subscribe( val => console.log( 'transitStateResult$', val ) );
  }


  async transitState(
    userInput:       UserInput,
    currState:       GameState,
    myIndex:         number,
    playersNameList: string[],
  ): Promise<void> {
    // 現在のゲーム状態をコピー
    const nextState = new GameState( this.utils.copyObject( currState ) );
    // console.log('transitState', nextState);
    const pid = userInput.data.playerId;
    const playersName = playersNameList[ pid ];

    // コマンドの処理
    switch ( userInput.command ) {
      case 'increment turnCounter':
        nextState.incrementTurnCounter();
        nextState.turnInfo.phase = '';
        break;

      case 'clicked goToNextPhase':
        nextState.turnInfo.phase
          = this.shortcut.nextPhase( nextState.turnInfo.phase );
        break;

      case 'clicked finishMyTurn':
        if ( nextState.gameIsOverConditions() ) {
          nextState.turnInfo.phase = 'GameIsOver';
        } else {
          nextState.turnInfo.phase = 'CleanUp';
        }
        break;

      case 'clicked sortHandcards':
        this.shortcut.sortHandCards( nextState, pid );
        break;

      case 'play all treasures':
        await this.shortcut.playAllTreasures(
                nextState,
                pid,
                playersName,
                userInput.data.shuffleBy );
        break;

      case 'clicked card':
        await this.shortcut.onCardClick( nextState, userInput, playersName );
        break;

      default:
        console.log(`There is no command named "${userInput.command}".`);
        break;
    }

    // フェーズごとの処理
    await this.gameloop.phaseAction(
            nextState,
            userInput,
            playersName );

    // 自動で手札をソート
    if ( userInput.data.autoSort ) {
      this.shortcut.sortHandCards( nextState, pid );
    }

    this.gameState.setGameState( nextState );
    this.setNextGameState( nextState );
  }


  setNextGameState( gameState: GameState ) {
    this.transitStateResultSource.next( gameState );
  }
}
