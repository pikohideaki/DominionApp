import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
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
  randomizerGroupID$:  Observable<string>;
  onlineGame: {
    isSelectedExpansions$: Observable<boolean[]>,
    numberOfPlayers$:      Observable<number>,
    roomID$:               Observable<string>,
    gameStateID$:          Observable<string>,
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
    this.randomizerGroupID$ = this.myUserInfo$.map( e => e.randomizerGroupID ).distinctUntilChanged();
    this.onlineGame = {
      isSelectedExpansions$ : Observable.combineLatest(
                this.database.expansionsNameList$.map( list => list.map( _ => false ) ),
                this.myUserInfo$.map( e => e.onlineGame.isSelectedExpansions ).distinctUntilChanged(),
                (initArray, isSelectedExpansions) => initArray.map( (_, i) => !!isSelectedExpansions[i] ) ),
      numberOfPlayers$ : this.myUserInfo$.map( e => e.onlineGame.numberOfPlayers ).distinctUntilChanged(),
      roomID$          : this.myUserInfo$.map( e => e.onlineGame.roomID          ).distinctUntilChanged(),
      gameStateID$     : this.myUserInfo$.map( e => e.onlineGame.gameStateID     ).distinctUntilChanged(),
      chatOpened$      : this.myUserInfo$.map( e => e.onlineGame.chatOpened      ).distinctUntilChanged(),
    };

    this.signedInToRandomizerGroup$ = this.randomizerGroupID$.map( groupID => !!groupID );

    this.uid$.subscribe( val => this.uid = val );
  }


  setMyName( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.name( this.uid, value );
  }

  setRandomizerGroupID( value: string ) {
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

  setOnlineGameRoomID( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.roomId( this.uid, value );
  }

  setOnlineGameStateID( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.gameStateId( this.uid, value );
  }

  setOnlineGameChatOpened( value: boolean ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.chatOpened( this.uid, value );
  }

}
