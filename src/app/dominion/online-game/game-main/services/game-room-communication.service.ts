import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/startWith';

import { DCardPath        } from '../../../../classes/game-state';
import { ChatMessage      } from '../../../../classes/chat-message';
import { GameCommunication,
    UserInput,
    UserInputCommand } from '../../../../classes/game-room-communication';

import { MyUserInfoService             } from '../../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';
import { MyGameRoomService } from './my-game-room.service';


@Injectable()
export class GameRoomCommunicationService {

  private myName$: Observable<string>
    = this.user.name$.first();
  private communicationId$: Observable<string>
    = this.user.onlineGame.communicationId$.first();

  chatList$:          Observable<ChatMessage[]>;
  userInputList$:     Observable<UserInput[]>;
  resetGameClicked$:  Observable<number>;
  thinkingState$:     Observable<boolean[]>;
  isTerminated$:      Observable<boolean>;
  resultIsSubmitted$: Observable<boolean>;


  constructor(
    private afdb: AngularFireDatabase,
    private user: MyUserInfoService,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService,
  ) {
    // observables

    const gameRoomCommunication$
      = Observable.combineLatest(
          this.database.onlineGameCommunicationList$,
          this.myGameRoomService.gameRoomCommunicationId$,
          (list, id) => list.find( e => e.databaseKey === id ) || new GameCommunication() );

    this.chatList$
      = this.myGameRoomService.gameRoomCommunicationId$
          .switchMap( id =>
            this.afdb.list<ChatMessage>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/chatList` )
            .valueChanges(['child_added']) )
          .distinctUntilChanged( (a, b) => a === b, x => x.length );

    this.userInputList$
      = this.myGameRoomService.gameRoomCommunicationId$
          .switchMap( id =>
            this.afdb.list<UserInput>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/userInputList` )
            .valueChanges(['child_added']) )
          .distinctUntilChanged( (a, b) => a === b, x => x.length );

    this.resetGameClicked$
      = this.myGameRoomService.gameRoomCommunicationId$
          .switchMap( id =>
            this.afdb.object<number>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/resetGameClicked` )
            .valueChanges() )
          .distinctUntilChanged();

    this.thinkingState$
      = this.myGameRoomService.gameRoomCommunicationId$
          .switchMap( id =>
            this.afdb.list<boolean>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/thinkingState` )
            .valueChanges() )
          .filter( list => list !== undefined && list.length > 0 )
          .distinctUntilChanged();

    this.isTerminated$
      = this.myGameRoomService.gameRoomCommunicationId$
          .switchMap( id =>
            this.afdb.object<boolean>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/isTerminated` )
            .valueChanges() )
          .distinctUntilChanged();

    this.resultIsSubmitted$
      = this.myGameRoomService.gameRoomCommunicationId$
          .switchMap( id =>
            this.afdb.object<boolean>(
              `${this.database.fdPath.onlineGameCommunicationList}/${id}/resultIsSubmitted` )
            .valueChanges() )
          .distinctUntilChanged();
  }


  async sendMessage( messageString: string ) {
    const communicationId = await this.communicationId$.toPromise();
    const myName = await this.myName$.toPromise();
    const msg = new ChatMessage({
                  playerName: myName,
                  content: messageString,
                  timeStamp: Date.now()
                });
    await this.database.onlineGameCommunication
            .sendMessage( communicationId, msg );
  }

  async sendUserInput(
    userInputCommand: UserInputCommand,
    playerId: number,
    clickedCardId?: number
 ) {
    const communicationId = await this.communicationId$.toPromise();
    const userInput = new UserInput( userInputCommand, playerId, clickedCardId );
    await this.database.onlineGameCommunication
            .sendUserInput( communicationId, userInput );
  }


  async removeAllUserInput() {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .removeAllUserInput( communicationId );
  }

  async setThinkingState( playerId: number, state: boolean ) {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .setThinkingState( communicationId, playerId, state );
  }

  async setTerminatedState( state: boolean ) {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .setTerminatedState( communicationId, state );
  }

  async setResultSubmittedState( state: boolean ) {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .setResultSubmittedState( communicationId, state );
  }
}
