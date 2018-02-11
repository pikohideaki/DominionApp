import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/combineLatest';

import { GameCommunication, StateTransition, Instruction } from '../../../classes/game-room-communication';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { ChatMessage } from '../../../classes/chat-message';
import { MyGameRoomService } from './my-game-room.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { DCardPath } from '../../../classes/game-state';


@Injectable()
export class GameRoomCommunicationService {

  private communicationId: string;
  private myName: string = '';

  private ready$: Observable<boolean>;
  chatList$: Observable<ChatMessage[]>;
  moves$: Observable<StateTransition[]>;


  constructor(
    private afdb: AngularFireDatabase,
    private user: MyUserInfoService,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService,
  ) {
    // observables
    this.ready$
      = this.user.onlineGame.roomId$
          .first().map( _ => true )
          .startWith( false );

    const gameRoomCommunication$
      = Observable.combineLatest(
          this.database.onlineGameCommunicationList$,
          this.myGameRoomService.myGameRoom$.map( e => e.gameRoomCommunicationId ),
          (list, id) => list.find( e => e.databaseKey === id ) || new GameCommunication() );

    this.chatList$
      = this.myGameRoomService.myGameRoom$.map( e => e.gameRoomCommunicationId )
          .switchMap( id =>
            this.afdb.list<ChatMessage>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/chatList` )
            .valueChanges(['child_added']) )
          .distinctUntilChanged( (a, b) => a === b, x => x.length );
            // .map( list => list.map( e => new ChatMessage(e) ) ) );

    this.moves$
      = this.myGameRoomService.myGameRoom$.map( e => e.gameRoomCommunicationId )
          .switchMap( id =>
            this.afdb.list<StateTransition>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/moves` )
            .valueChanges(['child_added', 'child_removed']) )
          .distinctUntilChanged( (a, b) => a === b, x => x.length );
            // .map( list => list.map( e => new MoveInGame(e) ) ) );

    // subscriptions
    this.user.onlineGame.communicationId$.subscribe( val => this.communicationId = val );
    this.user.name$.subscribe( val => this.myName = val );
  }

  async sendMessage( messageString: string ) {
    await this.ready$.filter( e => e ).toPromise();
    const msg = new ChatMessage({ playerName: this.myName, content: messageString, timeStamp: Date.now() });
    await this.database.onlineGameCommunication.sendMessage( this.communicationId, msg );
  }

  async sendMove(
    name: Instruction,
    data: {
      value?: any,
      cardIdArray?: number[],
      playerIdArray?: number[],
      dest?: DCardPath[],
      playerId?: number,
    }
 ) {
    await this.ready$.filter( e => e ).toPromise();
    const move = new StateTransition();
    move.instruction = name;
    move.data = data;
    await this.database.onlineGameCommunication.sendMove( this.communicationId, move );
  }


  async removeAllMoves() {
    await this.ready$.filter( e => e ).toPromise();
    await this.database.onlineGameCommunication.removeAllMoves( this.communicationId );
  }
}
