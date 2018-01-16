import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AngularFireDatabase } from 'angularfire2/database';

import { UtilitiesService, Stopwatch } from '../../../my-own-library/utilities.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyGameRoomService  } from './my-game-room.service';

import {
    GameRoom,
    TurnInfo,
    CommonCardData$$,
    CardDataForPlayer$$,
    PlayersCards,
    BasicCards,
    KingdomCards,
    PlayerData,
  } from '../../../classes/game-room';
import { ChatMessage } from '../../../classes/chat-message';



@Injectable()
export class MyGameStateService {
  private dataIsReady = {
    myGameStateID: new Subject(),
    myName: new Subject(),
  };

  commonCardData$$: CommonCardData$$;
  cardDataForMe$$:  CardDataForPlayer$$;

  turnCounter$:  Observable<number>;
  turnInfo$:     Observable<TurnInfo>;
  playersData$:  Observable<PlayerData[]>;
  playersCards$: Observable<PlayersCards[]>;
  BasicCards$:   Observable<BasicCards>;
  KingdomCards$: Observable<KingdomCards>;
  TrashPile$:    Observable<number[]>;
  chatList$:     Observable<ChatMessage[]>;

  turnPlayerIndex$:     Observable<number>;
  turnPlayersCards$:    Observable<PlayersCards>;
  nextTurnPlayerIndex$: Observable<number>;

  private myGameStateID: string;
  private myName: string;

  /* path */
  private rootPath = this.database.fdPath.onlineGameStateList;


  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService,
    private afdb: AngularFireDatabase,
    private myGameRoomService: MyGameRoomService,
  ) {
    const gameStateID$ = this.myUserInfo.onlineGame.gameStateID$;

    const myIndex$ = Observable.combineLatest(
        this.myGameRoomService.myGameRoom$,
        this.myUserInfo.name$,
        (myGameRoom, myName) => myGameRoom.playersName.findIndex( e => e === myName ) )
      .first();

    // this.commonCardData$$ = {
    //   cardListIndex$ :
    //     gameStateID$.flatMap( gameStateID =>
    //         this.afdb.list(`${this.rootPath}/${gameStateID}/commonCardData/cardListIndex`)
    //           .map( list => list.map( e => e.$value ) ) ),
    // };

    // this.cardDataForMe$$ = {
    //   faceUp$ :
    //     Observable.combineLatest( gameStateID$, myIndex$ ).flatMap( ([gameStateID, myIndex]) =>
    //         this.afdb.list(`${this.rootPath}/${gameStateID}/cardDataForPlayer/${myIndex}/faceUp`)
    //           .map( list => list.map( e => e.$value ) ) ),

      // isButton$ :
      //   Observable.combineLatest( gameStateID$, myIndex$ ).flatMap( ([gameStateID, myIndex]) =>
      //       this.afdb.list(`${this.rootPath}/${gameStateID}/cardDataForPlayer/${myIndex}/isButton`)
      //         .map( list => list.map( e => e.$value ) ) ),
    // };

    // this.turnCounter$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.object(`${this.rootPath}/${gameStateID}/turnCounter`)
    //             .map( e => e.$value || 0 ) );

    // this.turnInfo$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.object(`${this.rootPath}/${gameStateID}/turnInfo`)
    //             .map( e => new TurnInfo(e) ) );

    // this.playersData$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.list  (`${this.rootPath}/${gameStateID}/playersData`)
    //             .map( list => list.map( e => new PlayerData(e) ) ) );

    // this.playersCards$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.list  (`${this.rootPath}/${gameStateID}/cards/playersCards`)
    //             .map( list => list.map( e => new PlayersCards(e) )) );

    // this.BasicCards$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.object(`${this.rootPath}/${gameStateID}/cards/BasicCards`)
    //             .map( e => new BasicCards(e) ) );

    // this.KingdomCards$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.list(`${this.rootPath}/${gameStateID}/cards/KingdomCards`)
    //             .map( e => new KingdomCards(e) ) );

    // this.TrashPile$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.list(`${this.rootPath}/${gameStateID}/cards/TrashPile` )
    //             .map( list => list.map( e => e.$key ) ) );

    // this.chatList$
    //   = gameStateID$.flatMap( gameStateID =>
    //       this.afdb.list  (`${this.rootPath}/${gameStateID}/chatList`)
    //             .map( list => list.map( e => new ChatMessage(e) ) ) );

    // this.turnPlayerIndex$ = Observable.combineLatest(
    //     this.turnCounter$,
    //     this.playersData$.map( e => e.length ).distinctUntilChanged(),
    //     (turnCounter, numberOfPlayers) => turnCounter % numberOfPlayers );

    // this.nextTurnPlayerIndex$ = Observable.combineLatest(
    //     this.turnCounter$,
    //     this.playersData$.map( e => e.length ).distinctUntilChanged(),
    //     (turnCounter, numberOfPlayers) => (turnCounter + 1) % numberOfPlayers );

    // this.turnPlayersCards$ = Observable.combineLatest(
    //     this.playersCards$, this.turnPlayerIndex$,
    //     (playersCards, turnPlayerIndex) => playersCards[turnPlayerIndex] );

    // this.myUserInfo.onlineGame.gameStateID$.subscribe( val => {
    //   this.myGameStateID = val;
    //   this.dataIsReady.myGameStateID.complete();
    // });

    // this.myUserInfo.name$.subscribe( val => {
    //   this.myName = val;
    //   this.dataIsReady.myName.complete();
    // });

// this.commonCardData$$.cardListIndex$.subscribe( val => console.log( 'cardListIndex', val ) );
// this.cardDataForMe$$.faceUp$        .subscribe( val => console.log( 'faceUp'       , val ) );
// this.cardDataForMe$$.isButton$      .subscribe( val => console.log( 'isButton'     , val ) );
// this.turnCounter$  .subscribe( val => console.log( 'turnCounter' , val ) );
// this.turnInfo$     .subscribe( val => console.log( 'turnInfo'    , val ) );
// this.playersData$  .subscribe( val => console.log( 'playersData' , val ) );
// this.playersCards$ .subscribe( val => console.log( 'playersCards', val ) );
// this.BasicCards$   .subscribe( val => console.log( 'BasicCards'  , val ) );
// this.KingdomCards$ .subscribe( val => console.log( 'KingdomCards', val ) );
// this.TrashPile$    .subscribe( val => console.log( 'TrashPile'   , val ) );
// this.chatList$     .subscribe( val => console.log( 'chatList'    , val ) );

// this.turnPlayerIndex$     .subscribe( val => console.log( 'turnPlayerIndex'    , val ) );
// this.nextTurnPlayerIndex$ .subscribe( val => console.log( 'nextTurnPlayerIndex', val ) );
// this.turnPlayersCards$    .subscribe( val => console.log( 'turnPlayersCards'   , val ) );

  }



  async benchmark( value ) {
    const stopwatch = new Stopwatch('my-game-state::benchmark');
    stopwatch.start(true);
    await this.afdb.object(`${this.rootPath}/${this.myGameStateID}/cardDataForPlayer/0/faceUp/1`).set( value );
    stopwatch.stop();
    stopwatch.printResult();
  }

  async benchmark2( value ) {
    const timestamp = (new Date()).valueOf();
    const stopwatch = new Stopwatch('my-game-state::benchmark2');
    stopwatch.start(true);
    await this.afdb.object(`${this.rootPath}/${this.myGameStateID}/${timestamp}`).set( value );
    stopwatch.stop();
    stopwatch.printResult();
  }



  async update( object: Object ) {
    const stopwatch = new Stopwatch('my-game-state::update');
    stopwatch.start(true);
    await this.dataIsReady.myGameStateID.asObservable().toPromise();
    await this.database.onlineGameState.update( this.myGameStateID, object );
    stopwatch.stop();
    stopwatch.printResult();
  }



  async addMessageToChatList( message: string ) {
    await this.dataIsReady.myGameStateID.asObservable().toPromise();
    return this.database.onlineGameState.addMessage(
      this.myGameStateID,
      new ChatMessage( {
        userName : this.myName,
        content    : message,
        timeStamp : (new Date()).valueOf(),
      }) );
  }



  async setTurnCounter( value: number ) {
    this.database.onlineGameState.set.turnCounter( this.myGameStateID, value );
  }

  async setTurnInfo( value ) {
    this.database.onlineGameState.set.turnInfo( this.myGameStateID, value );
  }

  async setPhase( value: string ) {
    this.database.onlineGameState.set.phase( this.myGameStateID, value );
  }


  async updateCardDataForPlayer( playerIndex: number, property: string, value: Object ) {
    this.afdb.object(`${this.rootPath}/${this.myGameStateID}/cardDataForPlayer/${playerIndex}/${property}`).update( value );
  }


  async removeCard( pathSuffix: string, cardID ) {
    if ( !pathSuffix ) return;
    await this.dataIsReady.myGameStateID.asObservable().toPromise();
    const path = `${this.rootPath}/${this.myGameStateID}/cards/${pathSuffix}/${cardID}`;
    await this.afdb.object( path ).remove();
  }

  /**
   * add card to tail of the list.
   *
   */
  async addCard( pathSuffix: string, cardID, orderValue: number = Date.now() ) {
    if ( !pathSuffix ) return;
    await this.dataIsReady.myGameStateID.asObservable().toPromise();
    const path = `${this.rootPath}/${this.myGameStateID}/cards/${pathSuffix}/${cardID}`;
    await this.afdb.object( path ).set( orderValue );
  }

}
