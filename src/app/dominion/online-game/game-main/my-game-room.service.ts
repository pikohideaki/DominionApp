import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { GameRoom } from '../../../classes/game-room';


@Injectable()
export class MyGameRoomService {

  myGameRoom$: Observable<GameRoom>;

  myIndex$: Observable<number>;

  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
    this.myGameRoom$
      = this.database.onlineGameRoomList$.combineLatest(
            this.myUserInfo.onlineGame.roomID$,
            (list, id) => (list.find( e => e.databaseKey === id ) || new GameRoom()) )
          .distinctUntilChanged();

    this.myIndex$ = Observable.combineLatest(
        this.myGameRoom$.map( e => e.playersName ).distinctUntilChanged(),
        this.myUserInfo.name$,
        (players, myName) => players.findIndex( e => e === myName ) )
      .first();
  }


}
