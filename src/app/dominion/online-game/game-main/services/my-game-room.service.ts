import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';

import { GameRoom } from '../../../../classes/game-room';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';
import { GameState } from '../../../../classes/game-state';

import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';


@Injectable()
export class MyGameRoomService {

  myGameRoom$: Observable<GameRoom>
    = this.database.onlineGameRooms$.combineLatest(
          this.myUserInfo.onlineGame.roomId$,
          (list, id) => (list.find( e => e.databaseKey === id ) || new GameRoom()) );

  initialState$: Observable<GameState>
    = this.myGameRoom$.map( e => new GameState( e.initialState ) );

  myIndex$: Observable<number>
    = Observable.combineLatest(
          this.myGameRoom$.map( e => e.playersNameShuffled() ).distinctUntilChanged(),
          this.myUserInfo.name$,
          (playersName, myName) => playersName.findIndex( e => e === myName ) )
        .first();

  playersNameShuffled$: Observable<string[]>
    = this.myGameRoom$.map( e => e.playersNameShuffled() );

  gameRoomCommunicationId$
    = this.myGameRoom$.map( e => e.gameRoomCommunicationId )
        .distinctUntilChanged();

  Prosperity$
    = this.myGameRoom$.map( e => e.selectedCards.Prosperity )
        .startWith( false )
        .distinctUntilChanged();

  numberOfPlayers$: Observable<number>
    = this.myGameRoom$.map( e => e.numberOfPlayers )
        .distinctUntilChanged();



  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
  }
}