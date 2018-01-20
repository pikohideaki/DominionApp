import { Injectable } from '@angular/core';

import { Observable      } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/from';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { GameRoom } from '../../../classes/game-room';
import { GameCommunication } from '../../../classes/game-room-communication';
import {
    GameState,
    DCard,
    BasicCards,
    KingdomCards,
    PlayerData,
    PlayerCards,
    TurnInfo,
  } from '../../../classes/game-state';
import { MyGameRoomService } from './my-game-room.service';


@Injectable()
export class GameStateService {
  myGameRoom$ = this.myGameRoomService.myGameRoom$;
  myGameRoom = new GameRoom();

  myIndex$: Observable<number>;
  myIndex: number = 0;

  gameCommunications$: Observable<GameCommunication>;

  gameSnapshotSource = new BehaviorSubject<GameState>( new GameState() );
  gameSnapshot$: Observable<GameState>
    = this.gameSnapshotSource.asObservable()
        .startWith( new GameState() );

  // observables
  turnInfo$:         Observable<TurnInfo>;
  allPlayersData$:   Observable<PlayerData[]>;
  turnCounter$:      Observable<number>;

  allPlayersCards$:  Observable<PlayerCards[]>;
  BasicCards$:       Observable<BasicCards>;
  KingdomCards$:     Observable<KingdomCards>;
  trashPile$:        Observable<DCard[]>;
  BlackMarketPile$:  Observable<DCard[]>;

  numberOfPlayers$:     Observable<number>;
  turnPlayerCards$:    Observable<PlayerCards>;
  turnPlayerIndex$:     Observable<number>;
  nextTurnPlayerIndex$: Observable<number>;


  // instructions
  ins: {
    turnInfo: {
      setPhase:  (val) => void,
      setAction: (val) => void,
      setBuy:    (val) => void,
      setCoin:   (val) => void,
    }
  };



  constructor(
    private utils: UtilitiesService,
    private myGameRoomService: MyGameRoomService,
    private database: CloudFirestoreMediatorService,
  ) {
    // observables
    this.gameCommunications$ = Observable.combineLatest(
        this.database.onlineGameCommunicationList$,
        this.myGameRoomService.myGameRoom$.map( e => e.gameRoomCommunicationId ),
        (list, id) => list.find( e => e.databaseKey === id ) );

    this.myIndex$         = this.myGameRoomService.myIndex$;
    this.numberOfPlayers$ = this.myGameRoomService.myGameRoom$.map( e => e.numberOfPlayers );

    this.turnCounter$     = this.gameSnapshot$.map( e => e.turnCounter     );
    this.turnInfo$        = this.gameSnapshot$.map( e => e.turnInfo        );
    this.allPlayersData$  = this.gameSnapshot$.map( e => e.allPlayersData  );

    this.allPlayersCards$ = this.gameSnapshot$.map( e => e.DCards.allPlayersCards );
    this.BasicCards$      = this.gameSnapshot$.map( e => e.DCards.BasicCards      );
    this.KingdomCards$    = this.gameSnapshot$.map( e => e.DCards.KingdomCards    );
    this.trashPile$       = this.gameSnapshot$.map( e => e.DCards.trashPile       );
    this.BlackMarketPile$ = this.gameSnapshot$.map( e => e.DCards.BlackMarketPile );

    this.turnPlayerIndex$ = Observable.combineLatest(
        this.turnCounter$, this.numberOfPlayers$,
        (turnCounter, numberOfPlayers) =>
          this.myGameRoom.playerShuffler[ turnCounter % numberOfPlayers ] );

    this.nextTurnPlayerIndex$ = Observable.combineLatest(
        this.turnCounter$, this.numberOfPlayers$,
        (turnCounter, numberOfPlayers) =>
          this.myGameRoom.playerShuffler[ (turnCounter + 1) % numberOfPlayers ] );

    this.turnPlayerCards$
      = Observable.combineLatest(
            this.allPlayersCards$, this.turnPlayerIndex$,
            (allPlayersCards, turnPlayerIndex) => allPlayersCards[ turnPlayerIndex ] );


    // subscriptions
    this.myGameRoom$  .subscribe( val => this.myGameRoom   = val );
    this.gameSnapshot$.subscribe( val => console.log('gameSnapshot: ', val ) );
    this.myIndex$     .subscribe( val => this.myIndex = val );

    // this.isMyTurn$.filter( e => e === true )
    //   .subscribe( () => this.gameLoopService.startMyTurn() );

    // initialize
    this.initialize();

    // methods
    this.ins.turnInfo = {
      setPhase:  (val) => {
        const currentValue = this.gameSnapshotSource.getValue();
        currentValue.turnInfo.phase = val;
        this.gameSnapshotSource.next( currentValue );
      },
      setAction: (val) => {
        const currentValue = this.gameSnapshotSource.getValue();
        currentValue.turnInfo.action = val;
        this.gameSnapshotSource.next( currentValue );
      },
      setBuy:    (val) => {
        const currentValue = this.gameSnapshotSource.getValue();
        currentValue.turnInfo.buy = val;
        this.gameSnapshotSource.next( currentValue );
      },
      setCoin:   (val) => {
        const currentValue = this.gameSnapshotSource.getValue();
        currentValue.turnInfo.coin = val;
        this.gameSnapshotSource.next( currentValue );
      },
    };


  }


  // ゲーム初期状態の生成する．GameRoom.initialStateの情報を使用．
  async initialize() {
    const initState = await this.myGameRoom$.map( e => e.initialState ).first().toPromise();
    this.gameSnapshotSource.next( new GameState( initState ) );
  }



  incrementTurnCounter() {
    // this.turnCounter$
  }





}
