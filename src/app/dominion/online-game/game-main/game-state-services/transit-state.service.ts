import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/pairwise';

import { GameRoom } from '../../../../classes/game-room';
import { UserInput } from '../../../../classes/game-room-communication';
import { GameState, Phase } from '../../../../classes/game-state';
import { CardProperty } from '../../../../classes/card-property';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';
import { GameStateShortcutService } from './game-state-shortcut.service';
import { GameLoopService } from './game-loop.service';
import { GameRoomCommunicationService } from '../game-room-communication.service';
import { MyGameRoomService } from '../my-game-room.service';
import { GameStateService } from './game-state.service';
import { OnlineGameResultDialogComponent } from '../online-game-result-dialog/online-game-result-dialog.component';


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

  gameData$ = Observable.zip( this.userInput$, this.transitStateResult$ )
                .withLatestFrom( this.myGameRoom.Prosperity$ );


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
    userInput: UserInput,
    currState: GameState,
    Prosperity: boolean
  ): Promise<void> {
    // 現在のゲーム状態をコピー
    const nextState = new GameState( this.utils.copyObject( currState ) );
    // console.log('transitState', nextState);

    // コマンドの処理
    switch ( userInput.command ) {
      case 'increment turnCounter':
        nextState.turnCounter++;
        nextState.turnInfo.phase = '';
        break;

      case 'clicked goToNextPhase':
        nextState.turnInfo.phase = this.shortcut.nextPhase( nextState.turnInfo.phase );
        break;

      case 'clicked finishMyTurn':
        await this.shortcut.cleanUp( nextState, userInput.data.playerId, userInput.data.shuffleBy );
        if ( nextState.gameIsOverConditions( Prosperity ) ) {
          nextState.turnInfo.phase = 'GameIsOver';
        } else {
          nextState.turnCounter++;
          nextState.turnInfo.phase = '';
        }
        break;

      case 'clicked sortHandcards':
        this.shortcut.sortHandCards( nextState, userInput.data.playerId );
        break;

      case 'play all treasures':
        await this.shortcut.playAllTreasures( nextState, userInput.data.playerId, userInput.data.shuffleBy );
        break;

      case 'clicked card':
        await this.shortcut.onCardClick( nextState, userInput );
        break;

      default:
        console.log(`There is no command named "${userInput.command}".`);
        break;
    }

    // フェーズごとの処理
    await this.gameloop.phaseAction( nextState, userInput, Prosperity );

    this.gameState.setGameState( nextState );
    this.setNextGameState( nextState );

    // console.log( 'transitState', userInput, currState, nextState );
  }




  setNextGameState( gameState: GameState ) {
    this.transitStateResultSource.next( gameState );
  }
}
