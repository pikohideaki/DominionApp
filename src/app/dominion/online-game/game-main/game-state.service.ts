import { Injectable } from '@angular/core';

import { Observable      } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/from';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { GameRoom } from '../../../classes/game-room';
import { GameCommunication, StateTransition } from '../../../classes/game-room-communication';
import {
    GameState,
    DCard,
    BasicCards,
    KingdomCards,
    PlayerData,
    PlayerCards,
    TurnInfo,
    Phase,
    DCardPath,
    getDCardsByIdArray,
  } from '../../../classes/game-state';
import { MyGameRoomService } from './my-game-room.service';
import { GameRoomCommunicationService } from './game-room-communication.service';


@Injectable()
export class GameStateService {
  private myGameRoom$ = this.myGameRoomService.myGameRoom$;
  private moves$: Observable<StateTransition[]>
    = this.gameCommunicationService.moves$;

  // moves
  private loadMovesDoneSource = new BehaviorSubject<boolean>( false );
  loadMovesDone$ = this.loadMovesDoneSource.asObservable();
  private lastAppliedIndex: number = -1;


  // observables
  private turnInfoSource = new BehaviorSubject<TurnInfo>( new TurnInfo );
  turnInfo$: Observable<TurnInfo> = this.turnInfoSource.asObservable();
  action$ = this.turnInfo$.map( e => e.action ).distinctUntilChanged();
  buy$    = this.turnInfo$.map( e => e.buy    ).distinctUntilChanged();
  coin$   = this.turnInfo$.map( e => e.coin   ).distinctUntilChanged();
  phase$  = this.turnInfo$.map( e => e.phase  ).distinctUntilChanged();

  private allPlayersDataSource = new BehaviorSubject<PlayerData[]>([]);
  allPlayersData$: Observable<PlayerData[]> = this.allPlayersDataSource.asObservable();

  private turnCounterSource = new BehaviorSubject<number>(0);
  turnCounter$: Observable<number> = this.turnCounterSource.asObservable();

  private allPlayersCardsSource = new BehaviorSubject<PlayerCards[]>([]);
  allPlayersCards$: Observable<PlayerCards[]> = this.allPlayersCardsSource.asObservable();

  private BasicCardsSource = new BehaviorSubject<BasicCards>( new BasicCards() );
  BasicCards$: Observable<BasicCards> = this.BasicCardsSource.asObservable();

  private KingdomCardsSource = new BehaviorSubject<KingdomCards>( new KingdomCards() );
  KingdomCards$: Observable<KingdomCards> = this.KingdomCardsSource.asObservable();

  private trashPileSource = new BehaviorSubject<DCard[]>([]);
  trashPile$: Observable<DCard[]> = this.trashPileSource.asObservable();

  private BlackMarketPileSource = new BehaviorSubject<DCard[]>([]);
  BlackMarketPile$: Observable<DCard[]> = this.BlackMarketPileSource.asObservable();

  numberOfPlayers$: Observable<number>
    = this.myGameRoomService.myGameRoom$.map( e => e.numberOfPlayers )
        .distinctUntilChanged();

  gameSnapshot$: Observable<GameState>
    = Observable.combineLatest(
        this.numberOfPlayers$,
        this.turnInfo$,
        this.allPlayersData$,
        this.turnCounter$,
        this.allPlayersCards$,
        this.BasicCards$,
        this.KingdomCards$,
        this.trashPile$,
        this.BlackMarketPile$,
        ( numberOfPlayers,
          turnInfo,
          allPlayersData,
          turnCounter,
          allPlayersCards,
          basicCards,
          kingdomCards,
          trashPile,
          BlackMarketPile ) => new GameState({
            numberOfPlayers: numberOfPlayers,
            allPlayersData:  allPlayersData,
            turnCounter:     turnCounter,
            turnInfo:        turnInfo,
            DCards: {
              allPlayersCards: allPlayersCards,
              BasicCards:      basicCards,
              KingdomCards:    kingdomCards,
              trashPile:       trashPile,
              BlackMarketPile: BlackMarketPile,
            }
          }) );

  turnPlayerIndex$: Observable<number>
    = this.gameSnapshot$.map( e => e.turnPlayerIndex() ).distinctUntilChanged();
  nextTurnPlayerIndex$: Observable<number>
    = this.gameSnapshot$.map( e => e.nextTurnPlayerIndex() ).distinctUntilChanged();

  turnPlayerCards$:     Observable<PlayerCards>
    = Observable.combineLatest(
        this.allPlayersCards$, this.turnPlayerIndex$,
        (allPlayersCards, turnPlayerIndex) =>
          allPlayersCards[ turnPlayerIndex ] || new PlayerCards() );

  myCards$: Observable<PlayerCards>
    = Observable.combineLatest(
        this.allPlayersCards$, this.myGameRoomService.myIndex$,
        (allPlayersCards, myIndex) =>
          allPlayersCards[ myIndex ] || new PlayerCards() );



  // instructions
  setval = {
    incrementTurnCounter: () => {
      this.printChangeStateMethod('incrementTurnCounter');
      const currentValue = this.turnCounterSource.getValue();
      this.turnCounterSource.next( currentValue + 1 );
    },
    turnInfo: {
      phase:     (val: Phase ) => this.setvalTurnInfo('phase',  val),
      action:    (val: number) => this.setvalTurnInfo('action', val),
      buy:       (val: number) => this.setvalTurnInfo('buy',    val),
      coin:      (val: number) => this.setvalTurnInfo('coin',   val),
      addAction: (val: number) => this.addvalTurnInfo('action', val),
      addBuy:    (val: number) => this.addvalTurnInfo('buy',    val),
      addCoin:   (val: number) => this.addvalTurnInfo('coin',   val),
    },
    playerData: {
      VPtoken: (val: number, playerId: number) =>
          this.setvalPlayerData('VPtoken',  val, playerId ),
    },
    DCards: {
      faceUpCardsForPlayers:      ( cardIdArray: number[], playerIdArray: number[] ) =>
        this.setvalDCards('faceUp',   true,  cardIdArray, playerIdArray ),
      faceDownCardsForPlayers:    ( cardIdArray: number[], playerIdArray: number[] ) =>
        this.setvalDCards('faceUp',   false, cardIdArray, playerIdArray ),
      buttonizeCardsForPlayers:   ( cardIdArray: number[], playerIdArray: number[] ) =>
        this.setvalDCards('isButton', true,  cardIdArray, playerIdArray ),
      unbuttonizeCardsForPlayers: ( cardIdArray: number[], playerIdArray: number[] ) =>
        this.setvalDCards('isButton', false, cardIdArray, playerIdArray ),
      moveCardsTo: ( cardIdArray: number[], dest: DCardPath[] ) => {
        this.printChangeStateMethod('moveCardsTo', cardIdArray, dest );

        const DCards = {
          allPlayersCards : this.allPlayersCardsSource.getValue(),
          BasicCards      : this.BasicCardsSource     .getValue(),
          KingdomCards    : this.KingdomCardsSource   .getValue(),
          trashPile       : this.trashPileSource      .getValue(),
          BlackMarketPile : this.BlackMarketPileSource.getValue(),
        };

        // cards to be moved
        const pickedUpDCards = {
          allPlayersCards : [].concat( ...DCards.allPlayersCards
                                .map( pl => pl.getDCards( cardIdArray ) ) ),
          BasicCards      : DCards.BasicCards.getDCards( cardIdArray ),
          KingdomCards    : DCards.KingdomCards.getDCards( cardIdArray ),
          trashPile       : getDCardsByIdArray( cardIdArray, DCards.trashPile ),
          BlackMarketPile : getDCardsByIdArray( cardIdArray, DCards.BlackMarketPile ),
        };

        // remove cards
        DCards.allPlayersCards.forEach( pl => pl.removeDCards( cardIdArray ) );
        DCards.BasicCards.removeDCards( cardIdArray );
        DCards.KingdomCards.removeDCards( cardIdArray );
        DCards.trashPile = DCards.trashPile.filter( c => !cardIdArray.includes(c.id) );
        DCards.BlackMarketPile = DCards.BlackMarketPile.filter( c => !cardIdArray.includes(c.id) );

        let ref = <any>DCards;
        dest.forEach( addr => ref = ref[addr] );
        ref.push( ...pickedUpDCards.allPlayersCards );
        ref.push( ...pickedUpDCards.BasicCards      );
        ref.push( ...pickedUpDCards.KingdomCards    );
        ref.push( ...pickedUpDCards.trashPile       );
        ref.push( ...pickedUpDCards.BlackMarketPile );

        this.allPlayersCardsSource.next( DCards.allPlayersCards );
        this.BasicCardsSource     .next( DCards.BasicCards      );
        this.KingdomCardsSource   .next( DCards.KingdomCards    );
        this.trashPileSource      .next( DCards.trashPile       );
        this.BlackMarketPileSource.next( DCards.BlackMarketPile );
      },
    }
  };


  sendins = {
    incrementTurnCounter: () =>
      this.gameCommunicationService.sendMove('increment turnCounter', {}),
    turnInfo: {
      phase:     (val: Phase)  =>
        this.gameCommunicationService.sendMove('set phase',  { value: val } ),
      action:    (val: number) =>
        this.gameCommunicationService.sendMove('set action', { value: val } ),
      buy:       (val: number) =>
        this.gameCommunicationService.sendMove('set buy',    { value: val } ),
      coin:      (val: number) =>
        this.gameCommunicationService.sendMove('set coin',   { value: val } ),
      addAction: (val: number) => ( val === 0 ? null :
        this.gameCommunicationService.sendMove('add action', { value: val } ) ),
      addBuy:    (val: number) => ( val === 0 ? null :
        this.gameCommunicationService.sendMove('add buy',    { value: val } ) ),
      addCoin:   (val: number) => ( val === 0 ? null :
        this.gameCommunicationService.sendMove('add coin',   { value: val } ) ),
    },
    playerData: {
      VPtoken: (val: number, playerId: number) =>
          this.gameCommunicationService.sendMove('set VPtoken of player',
            { value: val, playerId: playerId } ),
    },
    DCard: {
      faceUpCardsForPlayers: ( cardIdArray: number[], playerIdArray: number[] ) =>
        ( this.isnull( cardIdArray ) || this.isnull( playerIdArray )
          ? null
          : this.gameCommunicationService.sendMove('face up cards for players',
            { cardIdArray: cardIdArray, playerIdArray: playerIdArray } ) ),
      faceDownCardsForPlayers: ( cardIdArray: number[], playerIdArray: number[] ) =>
        ( this.isnull( cardIdArray ) || this.isnull( playerIdArray )
          ? null
          : this.gameCommunicationService.sendMove('face down cards for players',
            { cardIdArray: cardIdArray, playerIdArray: playerIdArray } ) ),
      buttonizeCardsForPlayers: ( cardIdArray: number[], playerIdArray: number[] ) =>
        ( this.isnull( cardIdArray ) || this.isnull( playerIdArray )
          ? null
          : this.gameCommunicationService.sendMove('buttonize cards for players',
            { cardIdArray: cardIdArray, playerIdArray: playerIdArray } ) ),
      unbuttonizeCardsForPlayers: ( cardIdArray: number[], playerIdArray: number[] ) =>
        ( this.isnull( cardIdArray ) || this.isnull( playerIdArray )
          ? null
          : this.gameCommunicationService.sendMove('unbuttonize cards for players',
            { cardIdArray: cardIdArray, playerIdArray: playerIdArray } ) ),
      moveCardsTo: ( cardIdArray: number[], dest: DCardPath[] ) =>
        ( this.isnull( cardIdArray )
          ? null
          : this.gameCommunicationService.sendMove('move cards to',
            { cardIdArray: cardIdArray, dest: dest } ) ),
    }
  };


  // debug
  logSnapshotSource = new BehaviorSubject<void>(null);


  constructor(
    private utils: UtilitiesService,
    private myGameRoomService: MyGameRoomService,
    private database: CloudFirestoreMediatorService,
    private gameCommunicationService: GameRoomCommunicationService,
  ) {
    // subscriptions

    this.logSnapshotSource.asObservable()
        .withLatestFrom( this.gameSnapshot$, (_, s) => s )
      .subscribe( val => console.log('gameSnapshot: ', val ) );
    // this.gameSnapshot$
    //   .subscribe( val => console.log('gameSnapshot: ', val ) );

    // initialize
    this.startProcessing();
  }


  isnull( array ) {
    return (array === undefined || array.length === 0);
  }



  async initialize() {
    // GameRoom.initialStateをコピーしてゲーム初期状態の生成
    const initState = await this.myGameRoom$.map( e => new GameState( e.initialState ) )
                                  .first().toPromise();
    this.turnInfoSource       .next( initState.turnInfo               );
    this.allPlayersDataSource .next( initState.allPlayersData         );
    this.turnCounterSource    .next( initState.turnCounter            );
    this.allPlayersCardsSource.next( initState.DCards.allPlayersCards );
    this.BasicCardsSource     .next( initState.DCards.BasicCards      );
    this.KingdomCardsSource   .next( initState.DCards.KingdomCards    );
    this.trashPileSource      .next( initState.DCards.trashPile       );
    this.BlackMarketPileSource.next( initState.DCards.BlackMarketPile );
  }

  async startProcessing() {
    // 命令列の取得・適用を開始．
    await this.initialize();

    this.moves$.subscribe( moves => {
      const rangeBegin = this.lastAppliedIndex + 1;
      const rangeEnd   = moves.length;
      this.lastAppliedIndex = rangeEnd - 1;
      console.log( 'moves-subscription', moves, `[${rangeBegin}, ${rangeEnd})` );
      moves.slice( rangeBegin, rangeEnd ).forEach( move => {
        switch ( move.instruction ) {
          case 'increment turnCounter' : this.setval.incrementTurnCounter(); break;
          case 'set phase'  : this.setval.turnInfo.phase    ( move.data.value ); break;
          case 'set action' : this.setval.turnInfo.action   ( move.data.value ); break;
          case 'set buy'    : this.setval.turnInfo.buy      ( move.data.value ); break;
          case 'set coin'   : this.setval.turnInfo.coin     ( move.data.value ); break;
          case 'add action' : this.setval.turnInfo.addAction( move.data.value ); break;
          case 'add buy'    : this.setval.turnInfo.addBuy   ( move.data.value ); break;
          case 'add coin'   : this.setval.turnInfo.addCoin  ( move.data.value ); break;

          case 'set VPtoken of player' :
            this.setval.playerData.VPtoken( move.data.value, move.data.playerId );
            break;

          case 'face up cards for players' :
            this.setval.DCards.faceUpCardsForPlayers( move.data.cardIdArray, move.data.playerIdArray );
            break;
          case 'face down cards for players' :
            this.setval.DCards.faceDownCardsForPlayers( move.data.cardIdArray, move.data.playerIdArray );
            break;
          case 'buttonize cards for players' :
            this.setval.DCards.buttonizeCardsForPlayers( move.data.cardIdArray, move.data.playerIdArray );
            break;
          case 'unbuttonize cards for players' :
            this.setval.DCards.unbuttonizeCardsForPlayers( move.data.cardIdArray, move.data.playerIdArray );
            break;
          case 'move cards to' :
            this.setval.DCards.moveCardsTo( move.data.cardIdArray, move.data.dest );
            break;

          case 'face up cards for all players' :
            break;
          case 'face down cards for all players' :
            break;
          case 'buttonize cards for all players' :
            break;
          case 'unbuttonize cards for all players' :
            break;
          case 'trash' :
            break;
          case 'discard' :
            break;
          case 'play' :
            break;
          case 'gain' :
            break;
          case 'gain to' :
            break;
          case 'set aside' :
            break;

          default: console.error(`There is no instruction "${move.instruction}".`); break;
        }
      });
      this.loadMovesDoneSource.next( true );
    });
  }


  private setvalTurnInfo( key: string, val ) {
    this.printChangeStateMethod('setvalTurnInfo', key, val );
    const currentValue = this.turnInfoSource.getValue();
    currentValue[key] = val;
    this.turnInfoSource.next( currentValue );
  }
  private addvalTurnInfo( key: string, val: number ) {
    this.printChangeStateMethod('addvalTurnInfo', key, val );
    const currentValue = this.turnInfoSource.getValue();
    currentValue[key] += val;
    this.turnInfoSource.next( currentValue );
  }

  private setvalPlayerData( key: string, val, playerId: number ) {
    this.printChangeStateMethod('setvalPlayerData', key, val, playerId );
    const currentValue = this.allPlayersDataSource.getValue();
    currentValue[ playerId ][key] = val;
    this.allPlayersDataSource.next( currentValue );
  }

  private setvalDCards(
    member: ('faceUp'|'isButton'),
    val: boolean,
    cardIdArray: number[],
    playerIdArray: number[]
  ) {
    this.printChangeStateMethod('setvalDCards', member, val, cardIdArray, playerIdArray );

    const allPlayersCards = this.allPlayersCardsSource.getValue();
    const basicCards      = this.BasicCardsSource     .getValue();
    const kingdomCards    = this.KingdomCardsSource   .getValue();
    const trashPile       = this.trashPileSource      .getValue();
    const BlackMarketPile = this.BlackMarketPileSource.getValue();

    allPlayersCards.forEach( playerCards =>
      playerCards.getDCards( cardIdArray ).forEach( dcard =>
        playerIdArray.forEach( playerId => dcard[ member ][ playerId ] = val ) ) );
    basicCards.getDCards( cardIdArray ).forEach( dcard =>
        playerIdArray.forEach( playerId => dcard[ member ][ playerId ] = val ) );
    kingdomCards.getDCards( cardIdArray ).forEach( dcard =>
        playerIdArray.forEach( playerId => dcard[ member ][ playerId ] = val ) );
    trashPile.filter( c => cardIdArray.includes(c.id) ).forEach( dcard =>
        playerIdArray.forEach( playerId => dcard[ member ][ playerId ] = val ) );
    BlackMarketPile.filter( c => cardIdArray.includes(c.id) ).forEach( dcard =>
        playerIdArray.forEach( playerId => dcard[ member ][ playerId ] = val ) );

    this.allPlayersCardsSource.next( allPlayersCards );
    this.BasicCardsSource     .next( basicCards      );
    this.KingdomCardsSource   .next( kingdomCards    );
    this.trashPileSource      .next( trashPile       );
    this.BlackMarketPileSource.next( BlackMarketPile );
  }


  private printChangeStateMethod( ...args ) {
    // console.log(...args);
  }

}
