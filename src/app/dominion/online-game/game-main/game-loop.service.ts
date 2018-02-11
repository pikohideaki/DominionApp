import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/buffer';

import { DCard, GameState, PlayerCards } from '../../../classes/game-state';
import { GameStateService } from './game-state.service';
import { MessageDialogComponent } from '../../../my-own-library/message-dialog.component';
import { MyGameRoomService } from './my-game-room.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameStateShortcutService } from './game-state-shortcut.service';
import { CardProperty } from '../../../classes/card-property';
import { pairwise } from 'rxjs/operators';
import { filter } from 'rxjs/operator/filter';




@Injectable()
export class GameLoopService {

  private cardPropertyList$    = this.database.cardPropertyList$.first();
  private myIndex$             = this.gameRoomService.myIndex$;
  private gameSnapshot$        = this.gameStateService.gameSnapshot$;
  private turnPlayerIndex$     = this.gameStateService.turnPlayerIndex$;

  private initialStateIsReady$ = this.gameStateService.initialStateIsReady$;

  private myName$: Observable<string>
   = Observable.combineLatest(
        this.myIndex$,
        this.gameRoomService.myGameRoom$.map( e => e.playersNameShuffled() ),
        (myIndex, playerNameList) => playerNameList[ myIndex ] || '' )
      .distinctUntilChanged();

  private isMyTurn$
    = Observable.combineLatest(
          this.turnPlayerIndex$, this.myIndex$, (a, b) => a === b )
        .distinctUntilChanged();


  // 自分のターンでかつ初期化が完了した状態でのみphaseを出力
  // 自分のターンでないときは空文字を出力
  private myTurnPhase$
    = Observable.combineLatest(
          this.gameStateService.phase$,
          this.isMyTurn$,
          this.initialStateIsReady$,
          this.cardPropertyList$,
          (phase, isMyTurn, initializeDone, _) =>
            ( isMyTurn && initializeDone ? phase : '' ) )
        .distinctUntilChanged();

  private isStartOfMyTurn$   = this.myTurnPhase$.map( phase => phase === 'StartOfTurn').distinctUntilChanged();
  private isMyActionPhase$   = this.myTurnPhase$.map( phase => phase === 'Action'     ).distinctUntilChanged();
  private isMyActionXPhase$  = this.myTurnPhase$.map( phase => phase === 'Action*'    ).distinctUntilChanged();
  private isMyBuyPlayPhase$  = this.myTurnPhase$.map( phase => phase === 'BuyPlay'    ).distinctUntilChanged();
  private isMyBuyPlayXPhase$ = this.myTurnPhase$.map( phase => phase === 'BuyPlay*'   ).distinctUntilChanged();
  private isMyBuyCardPhase$  = this.myTurnPhase$.map( phase => phase === 'BuyCard'    ).distinctUntilChanged();
  private isMyNightPhase$    = this.myTurnPhase$.map( phase => phase === 'Night'      ).distinctUntilChanged();
  private isMyCleanUpPhase$  = this.myTurnPhase$.map( phase => phase === 'CleanUp'    ).distinctUntilChanged();
  private isEndOfMyTurn$     = this.myTurnPhase$.map( phase => phase === 'EndOfTurn'  ).distinctUntilChanged();
  private isMyBuyPhase$      = this.myTurnPhase$.map( phase => ['BuyPlay', 'BuyCard'].includes( phase ) )
                                  .distinctUntilChanged();


  private filterByObservable
    : <T>(source$: Observable<T>, filterBy$: Observable<boolean>) => Observable<T>
    = ( (source$, filterBy$) => {
      return source$
        .withLatestFrom( filterBy$.startWith( false ) )
        .filter( ([source, filterBy]) => filterBy === true )
        .map( ([source, filterBy]) => source );
    });

  private gameValues$ = Observable.combineLatest(
      this.myIndex$,
      this.gameSnapshot$,
      this.cardPropertyList$ );

  private filterAndAttachData = (( source$: Observable<boolean>, changedTo: boolean ) => {
    return this.filterByObservable( source$, this.initialStateIsReady$ )
        .pairwise()
        .filter( ([prev, curr]) => (
            changedTo ? prev === true  && curr === false
                      : prev === false && curr === true  ) )
        .withLatestFrom( this.gameValues$.startWith( [0, new GameState(), []] ) )
        .map( ([_, gameValues]) => gameValues );
  });

  private myTurnOnBegin$         = this.filterAndAttachData( this.isMyTurn$,         true  );
  private myTurnOnEnd$           = this.filterAndAttachData( this.isMyTurn$,         false );
  private myStartOfTurnOnBegin$  = this.filterAndAttachData( this.isStartOfMyTurn$,  true  );
  private myActionPhaseOnEnd$    = this.filterAndAttachData( this.isMyActionPhase$,  false );
  private myBuyPlayPhaseOnEnd$   = this.filterAndAttachData( this.isMyBuyPlayPhase$, false );
  private myNightPhaseOnBegin$   = this.filterAndAttachData( this.isMyNightPhase$,   true  );
  private myNightPhaseOnEnd$     = this.filterAndAttachData( this.isMyNightPhase$,   false );
  private myCleanUpPhaseOnBegin$ = this.filterAndAttachData( this.isMyCleanUpPhase$, true  );
  private myEndOfTurnOnBegin$    = this.filterAndAttachData( this.isEndOfMyTurn$,    true  );

  private myBuyPhaseOnEnd$       = this.filterAndAttachData( this.isMyBuyPhase$,     false );


  private myHandCards$
    = this.gameStateService.myCards$.map( e => e.HandCards )
        .distinctUntilChanged( (x, y) => x.length === y.length );

  private myHandCardsChangeInMyActionPhase$
    = this.filterByObservable( this.myHandCards$, this.isMyActionPhase$ )
        .withLatestFrom( this.gameValues$ );
  private myHandCardsChangeInMyBuyPlayPhase$
    = this.filterByObservable( this.myHandCards$, this.isMyBuyPlayPhase$ )
        .withLatestFrom( this.gameValues$ );
  private myHandCardsChangeInMyNightPhase$
    = this.filterByObservable( this.myHandCards$, this.isMyNightPhase$ )
        .withLatestFrom( this.gameValues$ );


  private ActionChangeInMyActionPhase$
    = this.filterByObservable( this.gameStateService.action$, this.isMyActionPhase$ )
        .distinctUntilChanged();

  private BuyChangeInMyBuyPhase$
    = this.filterByObservable( this.gameStateService.buy$, this.isMyBuyPhase$ )
        .distinctUntilChanged();

  private CoinOrSupplyChangeInMyBuyPhase$
    = this.filterByObservable(
        Observable.combineLatest(
          this.gameStateService.coin$,
          this.gameStateService.KingdomCards$.map( e => e.getDCards().length ).distinctUntilChanged(),
          this.gameStateService.BasicCards$  .map( e => e.getDCards().length ).distinctUntilChanged(),
          (coin, _1, _2) => coin ),
        this.isMyBuyPhase$ )
      .withLatestFrom( this.gameValues$ );




  constructor(
    private dialog: MatDialog,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private gameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameStateShortcut: GameStateShortcutService
  ) {
    // this.emit$.subscribe( console.log );

    // this.myTurnPhase$.subscribe( val => console.log('myTurnPhase$', val ) );
    // this.gameStateService.phase$.subscribe( val => console.log('phase$', val ) );
    // this.isMyBuyPlayPhase$.subscribe( val => console.log('isMyBuyPlayPhase$', val ) );
    // this.isMyBuyCardPhase$.subscribe( val => console.log('isMyBuyCardPhase$', val ) );
    // this.isMyBuyPhase$.subscribe( val => console.log('isMyBuyPhase$', val ) );

    const printObservableName: (...args) => void
      = (...args) => { console.log( ...args ); };

    this.myTurnOnBegin$.subscribe( gameSnapshot => {
      //// dialog
      this.gameStateShortcut.resetTurnInfo();
      this.gameStateService.sendins.turnInfo.phase('StartOfTurn');
    });

    this.myStartOfTurnOnBegin$.subscribe( gameSnapshot => {
      // ターン始めに予約されたカード・持続カードの解決など
      this.gameStateService.sendins.turnInfo.phase('Action');
    });


    { // Action phase
      this.myHandCardsChangeInMyActionPhase$.combineLatest( this.ActionChangeInMyActionPhase$ )
      .subscribe( ([[myHandCards, [myIndex, snapshot, cardList]], action]) => {
        printObservableName('myHandCardsChangeInMyActionPhase');
        if ( action > 0 ) {
          // 手札のアクションカードをボタン化
          this.gameStateShortcut.buttonizeIf(
              myHandCards, [myIndex],
              dcard => cardList[ dcard.cardListIndex ].cardTypes.includes('Action') );
        } else {
          // ただし action <= 0 のときは手札のアクションカードを非ボタン化
          this.gameStateShortcut.unbuttonizeIf(
              myHandCards, [myIndex],
              dcard => cardList[ dcard.cardListIndex ].cardTypes.includes('Action') );
        }
      });

      this.myActionPhaseOnEnd$.subscribe( ([myIndex, snapshot, cardList]) => {
        printObservableName('myActionPhaseOnEnd');
        this.gameStateShortcut.unbuttonizeIf(
            snapshot.DCards.allPlayersCards[ myIndex ].HandCards,
            [myIndex],
            dcard => cardList[ dcard.cardListIndex ].cardTypes.includes('Action') );
      });
    }



    { // Buy phase
      { // BuyPlay phase
        this.myHandCardsChangeInMyBuyPlayPhase$
        .subscribe( ([myHandCards, [myIndex, snapshot, cardList]]) => {
          printObservableName('myHandCardsChangeInMyBuyPlayPhase');
          // 手札の財宝カードをボタン化
          this.gameStateShortcut.buttonizeIf(
              myHandCards,
              [myIndex],
              dcard => cardList[ dcard.cardListIndex ].cardTypes.includes('Treasure') );
        });

        this.myBuyPlayPhaseOnEnd$.subscribe( ([myIndex, snapshot, cardList]) => {
          printObservableName('myBuyPlayPhaseOnEnd');

          this.gameStateShortcut.unbuttonizeIf(
              snapshot.DCards.allPlayersCards[ myIndex ].HandCards,
              [myIndex],
              dcard => cardList[ dcard.cardlistindex ].cardTypes.includes('Treasure') );
        });
      }

      { // Buy phase
        this.BuyChangeInMyBuyPhase$.filter( buy => buy <= 0 ).subscribe( _ => {
          printObservableName('BuyChangeInMyBuyPhase');
          // 購入権が0ならBuyPhase終了
          this.gameStateService.sendins.turnInfo.phase('Night');
        });

        this.CoinOrSupplyChangeInMyBuyPhase$.subscribe( ([coin, [myIndex, snapshot, cardList]]) => {
          printObservableName('CoinOrSupplyChangeInMyBuyPhase');
          // サプライの購入可能なカードをボタン化
          this.gameStateShortcut.buttonizeSupplyIf(
              snapshot, cardList, myIndex,
              (dcard: DCard) => (cardList[ dcard.cardListIndex ].cost.coin <= coin) );
        });

        this.myBuyPhaseOnEnd$.subscribe( ([myIndex, snapshot, cardList]) => {
          printObservableName('MyBuyPhaseOnEnd');
          this.gameStateShortcut.unbuttonizeSupply( snapshot, cardList, myIndex );
        });
      }
    }



    { // Night phase
      this.myNightPhaseOnBegin$.subscribe( ([myIndex, snapshot, cardList]) => {
        printObservableName('myNightPhaseOnBegin');
        // 未実装
        this.gameStateService.sendins.turnInfo.phase('CleanUp');
      });
    }

    this.myCleanUpPhaseOnBegin$.subscribe( ([myIndex, snapshot, cardList]) => {
        printObservableName('myCleanUpPhaseOnBegin');
      // 場と手札のカードを捨て札に
      this.gameStateShortcut.discard(
        [].concat( snapshot.turnPlayerCards().HandCards,
                   snapshot.turnPlayerCards().PlayArea )
            .map( c => c.id ),
          myIndex );
      // 次の5枚を引く
      this.gameStateShortcut.drawCards( 5, snapshot.turnPlayerCards(), myIndex );
      this.gameStateService.sendins.turnInfo.phase('EndOfTurn');
    });


    this.myEndOfTurnOnBegin$.subscribe( ([myIndex, snapshot, cardList]) => {
      printObservableName('myTurnOnEnd');
      // 次のプレイヤーへ
      this.gameStateService.sendins.incrementTurnCounter();
      this.gameStateService.sendins.turnInfo.phase('StartOfTurn');
    });

  }


  private async showDialog( myName: string ) {
    // console.log('showDialog');
    const dialogRef = this.dialog.open( MessageDialogComponent );
    dialogRef.componentInstance.message = `${myName}のターン`;
    this.utils.sleep(2);
    dialogRef.close();
  }


}
