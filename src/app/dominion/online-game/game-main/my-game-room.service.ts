import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';

import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { GameRoom } from '../../../classes/game-room';


@Injectable()
export class MyGameRoomService {

  myGameRoom$: Observable<GameRoom>;
  myIndex$: Observable<number>;

  constructor(
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
    this.myGameRoom$
      = this.database.onlineGameRooms$.combineLatest(
            this.myUserInfo.onlineGame.roomId$,
            (list, id) => (list.find( e => e.databaseKey === id ) || new GameRoom()) )
          .distinctUntilChanged();

    this.myIndex$ = Observable.combineLatest(
        this.myGameRoom$.map( e => e.playersName ).distinctUntilChanged(),
        this.myUserInfo.name$,
        (playersName, myName) => playersName.findIndex( e => e === myName ) )
      .first();
  }
}
