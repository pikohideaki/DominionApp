import { Injectable } from '@angular/core';

import { Observable      } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';

import { AngularFireAuth } from 'angularfire2/auth';

import { User } from '../classes/user';
import { CloudFirestoreMediatorService } from './cloud-firestore-mediator.service';


@Injectable()
export class MyUserInfoService {
  private uid: string = '';
  uid$:           Observable<string>;
  signedIn$:      Observable<boolean>;
  myDisplayName$: Observable<string>;

  private myUserInfo$: Observable<User>;
  name$:               Observable<string>;
  name_yomi$:          Observable<string>;
  randomizerGroupId$:  Observable<string>;
  onlineGame: {
    isSelectedExpansions$: Observable<boolean[]>,
    numberOfPlayers$:      Observable<number>,
    roomId$:               Observable<string>,
    communicationId$:      Observable<string>,
    chatOpened$:           Observable<boolean>,
  };

  signedInToRandomizerGroup$: Observable<boolean>;



  constructor(
    private afAuth: AngularFireAuth,
    private database: CloudFirestoreMediatorService,
  ) {
    this.signedIn$      = this.afAuth.authState.map( user => !!user );
    this.uid$           = this.afAuth.authState.map( user => ( !user ? '' : user.uid ) );
    this.myDisplayName$ = this.afAuth.authState.map( user => ( !user ? '' : user.displayName ) );

    this.myUserInfo$ = Observable.combineLatest(
        this.uid$,
        this.database.users$,
        ( uid: string, users: User[] ) =>
          (!uid || users.length === 0) ? new User() : users.find( e => e.databaseKey === uid ) || new User() );

    this.name$              = this.myUserInfo$.map( e => e.name              ).distinctUntilChanged();
    this.name_yomi$         = this.myUserInfo$.map( e => e.name_yomi         ).distinctUntilChanged();
    this.randomizerGroupId$ = this.myUserInfo$.map( e => e.randomizerGroupId ).distinctUntilChanged();
    this.onlineGame = {
      isSelectedExpansions$ : Observable.combineLatest(
                this.database.expansionsNameList$.map( list => list.map( _ => false ) ),
                this.myUserInfo$.map( e => e.onlineGame.isSelectedExpansions ).distinctUntilChanged(),
                (initArray, isSelectedExpansions) => initArray.map( (_, i) => !!isSelectedExpansions[i] ) ),
      numberOfPlayers$ : this.myUserInfo$.map( e => e.onlineGame.numberOfPlayers ).distinctUntilChanged(),
      roomId$          : this.myUserInfo$.map( e => e.onlineGame.roomId          ).distinctUntilChanged(),
      communicationId$     : this.myUserInfo$.map( e => e.onlineGame.communicationId     ).distinctUntilChanged(),
      chatOpened$      : this.myUserInfo$.map( e => e.onlineGame.chatOpened      ).distinctUntilChanged(),
    };

    this.signedInToRandomizerGroup$ = this.randomizerGroupId$.map( groupId => !!groupId );

    this.uid$.subscribe( val => this.uid = val );
  }


  setMyName( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.name( this.uid, value );
  }

  setRandomizerGroupId( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.randomizerGroupId( this.uid, value );
  }

  setOnlineGameIsSelectedExpansions( value: boolean[] ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.isSelectedExpansions( this.uid, value );
  }

  setOnlineGameNumberOfPlayers( value: number ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.numberOfPlayers( this.uid, value );
  }

  setOnlineGameRoomId( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.roomId( this.uid, value );
  }

  setOnlineGameStateId( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.communicationId( this.uid, value );
  }

  setOnlineGameChatOpened( value: boolean ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.chatOpened( this.uid, value );
  }

}
