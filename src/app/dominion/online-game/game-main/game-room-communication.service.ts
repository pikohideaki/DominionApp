import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/combineLatest';

import { GameCommunication } from '../../../classes/game-room-communication';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { ChatMessage } from '../../../classes/chat-message';
import { MyGameRoomService } from './my-game-room.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';


@Injectable()
export class GameRoomCommunicationService {

  private communicationId: string;
  private myName: string = '';

  private receiveDataDone$: Observable<boolean>;
  chatList$: Observable<ChatMessage[]>;
  gameRoomCommunication$: Observable<GameCommunication>;

  constructor(
    private user: MyUserInfoService,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService,
  ) {
    // observables
    this.receiveDataDone$
      = this.user.onlineGame.roomId$
          .first().map( _ => true )
          .startWith( false );

    this.gameRoomCommunication$
      = Observable.combineLatest(
          this.database.onlineGameCommunicationList$,
          this.myGameRoomService.myGameRoom$.map( e => e.gameRoomCommunicationId ),
          (list, id) => list.find( e => e.databaseKey === id ) || new GameCommunication() );

    this.chatList$ = this.gameRoomCommunication$.map( e => this.utils.objectEntries( e.chatList ) );

    // subscriptions
    this.user.onlineGame.communicationId$.subscribe( val => this.communicationId = val );
    this.user.name$.subscribe( val => this.myName = val );
  }

  async addMessage( messageString: string ) {
    await this.receiveDataDone$.filter( e => e ).toPromise();
    const msg = new ChatMessage({ playerName: this.myName, content: messageString, timeStamp: Date.now() });
    await this.database.onlineGameCommunication.addMessage( this.communicationId, msg );
  }

}
