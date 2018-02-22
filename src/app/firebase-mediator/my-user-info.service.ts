import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
  nameYomi$:           Observable<string>;
  randomizerGroupId$:  Observable<string>;
  onlineGame: {
    isSelectedExpansions$: Observable<boolean[]>,
    numberOfPlayers$:      Observable<number>,
    roomId$:               Observable<string>,
    communicationId$:      Observable<string>,
    chatOpened$:           Observable<boolean>,
    cardSizeAutoChange$:   Observable<boolean>,
    cardSizeRatio$:        Observable<number>,
    messageSpeed$:         Observable<number>,
    autoSort$:             Observable<boolean>,
    autoPlayAllTreasures$: Observable<boolean>,
  };

  signedInToRandomizerGroup$: Observable<boolean>;



  constructor(
    private afAuth: AngularFireAuth,
    private database: CloudFirestoreMediatorService,
  ) {
    this.signedIn$
      = this.afAuth.authState.map( user => !!user );
    this.uid$
      = this.afAuth.authState.map( user => ( !user ? '' : user.uid ) );
    this.myDisplayName$
      = this.afAuth.authState.map( user => ( !user ? '' : user.displayName ) );

    this.myUserInfo$ = Observable.combineLatest(
        this.uid$,
        this.database.users$,
        ( uid: string, users: User[] ) =>
          (!uid || users.length === 0)
              ? new User()
              : users.find( e => e.databaseKey === uid ) || new User() );

    this.name$
      = this.myUserInfo$.map( e => e.name )
          .distinctUntilChanged();
    this.nameYomi$
      = this.myUserInfo$.map( e => e.nameYomi )
          .distinctUntilChanged();
    this.randomizerGroupId$
      = this.myUserInfo$.map( e => e.randomizerGroupId )
          .distinctUntilChanged();
    this.onlineGame = {
      isSelectedExpansions$ : Observable.combineLatest(
                this.database.expansionNameList$.map( list => list.map( _ => false ) ),
                this.myUserInfo$.map( e => e.onlineGame.isSelectedExpansions )
                  .distinctUntilChanged(),
                (initArray, isSelectedExpansions) =>
                    initArray.map( (_, i) => !!isSelectedExpansions[i] ) ),
      numberOfPlayers$ :
        this.myUserInfo$.map( e => e.onlineGame.numberOfPlayers )
          .distinctUntilChanged(),
      roomId$ :
        this.myUserInfo$.map( e => e.onlineGame.roomId )
          .distinctUntilChanged(),
      communicationId$ :
        this.myUserInfo$.map( e => e.onlineGame.communicationId )
          .distinctUntilChanged(),
      chatOpened$ :
        this.myUserInfo$.map( e => e.onlineGame.chatOpened )
          .distinctUntilChanged(),
      cardSizeAutoChange$ :
        this.myUserInfo$.map( e => e.onlineGame.cardSizeAutoChange )
          .distinctUntilChanged(),
      cardSizeRatio$ :
        this.myUserInfo$.map( e => e.onlineGame.cardSizeRatio )
          .distinctUntilChanged(),
      messageSpeed$ :
        this.myUserInfo$.map( e => e.onlineGame.messageSpeed )
          .distinctUntilChanged(),
      autoSort$ :
        this.myUserInfo$.map( e => e.onlineGame.autoSort )
          .distinctUntilChanged(),
      autoPlayAllTreasures$ :
        this.myUserInfo$.map( e => e.onlineGame.autoPlayAllTreasures )
          .distinctUntilChanged(),
    };

    this.signedInToRandomizerGroup$
      = this.randomizerGroupId$.map( groupId => !!groupId );

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

  setOnlineGameIsSelectedExpansions( index: number, value: boolean ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.isSelectedExpansions( this.uid, index, value );
  }

  setOnlineGameNumberOfPlayers( value: number ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.numberOfPlayers( this.uid, value );
  }

  setOnlineGameRoomId( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.roomId( this.uid, value );
  }

  setGameCommunicationId( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.communicationId( this.uid, value );
  }

  setOnlineGameChatOpened( value: boolean ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.chatOpened( this.uid, value );
  }
  setOnlineGameCardSizeAutoChange( value: boolean ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.cardSizeAutoChange( this.uid, value );
  }
  setOnlineGameCardSizeRatio( value: number ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.cardSizeRatio( this.uid, value );
  }
  setOnlineGameMessageSpeed( value: number ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.messageSpeed( this.uid, value );
  }
  setOnlineGameAutoSort( value: boolean ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.autoSort( this.uid, value );
  }
  setOnlineGameAutoPlayAllTreasures( value: boolean ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.onlineGame.autoPlayAllTreasures( this.uid, value );
  }
}
