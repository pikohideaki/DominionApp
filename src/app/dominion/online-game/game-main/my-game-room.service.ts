import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';

import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { GameRoom } from '../../../classes/game-room';
import { UtilitiesService } from '../../../my-own-library/utilities.service';


@Injectable()
export class MyGameRoomService {

  myGameRoom$: Observable<GameRoom>
    = this.database.onlineGameRooms$.combineLatest(
          this.myUserInfo.onlineGame.roomId$,
          (list, id) => (list.find( e => e.databaseKey === id ) || new GameRoom()) );

  myIndex$: Observable<number>
    = Observable.combineLatest(
          this.myGameRoom$.map( e => e.playersNameShuffled() ).distinctUntilChanged(),
          this.myUserInfo.name$,
          (playersName, myName) => playersName.findIndex( e => e === myName ) )
        .first();

  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
    // this.myIndex$.subscribe( val => console.log('myIndex', val) );
    // this.myGameRoom$.map( e => e.playersNameShuffled() ).distinctUntilChanged()
    //   .subscribe( val => console.log('playersName', val) );
  }
}
