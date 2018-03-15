import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';

import { GameRoom } from '../../../../classes/online-game/game-room';
import { GameState } from '../../../../classes/online-game/game-state';

import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';
import { FireDatabaseService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';


@Injectable()
export class MyGameRoomService {

  myGameRoom$: Observable<GameRoom>
    = this.database.onlineGameRooms$.combineLatest(
          this.user.onlineGame.roomId$,
          (list, id) => (list.find( e => e.databaseKey === id ) || new GameRoom()) );

  initialState$: Observable<GameState>
    = this.myGameRoom$.map( e => e.initialState )
                      .filter( e => !e.isEmpty() );

  myIndex$: Observable<number>
    = Observable.combineLatest(
          this.myGameRoom$.map( e => e.playersNameShuffled() ).distinctUntilChanged(),
          this.user.name$,
          (playersName, myName) => playersName.findIndex( e => e === myName ) )
        .first();

  playersNameShuffled$: Observable<string[]>
    = this.myGameRoom$.map( e => e.playersNameShuffled() );

  gameRoomCommunicationId$
    = this.myGameRoom$.map( e => e.gameRoomCommunicationId )
        .distinctUntilChanged();

  private selectedCards$ = this.myGameRoom$.map( e => e.selectedCards );

  Prosperity$: Observable<boolean>
    = this.selectedCards$.map( e => e.Prosperity )
        .startWith( false )
        .distinctUntilChanged();

  usePotion$: Observable<boolean>
    = this.selectedCards$
        .combineLatest( this.database.cardPropertyList$ )
        .map( ([selectedCards, cardList]) => selectedCards.usePotion( cardList ) )
        .startWith( false )
        .distinctUntilChanged();

  numberOfPlayers$: Observable<number>
    = this.myGameRoom$.map( e => e.numberOfPlayers )
        .distinctUntilChanged();



  constructor(
    private database: FireDatabaseService,
    private user: MyUserInfoService
  ) {
  }
}
