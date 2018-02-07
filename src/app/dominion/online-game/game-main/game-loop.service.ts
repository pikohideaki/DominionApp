import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/pairwise';

import { DCard, GameState, PlayerCards } from '../../../classes/game-state';
import { GameStateService } from './game-state.service';
import { MessageDialogComponent } from '../../../my-own-library/message-dialog.component';
import { MyGameRoomService } from './my-game-room.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameStateShortcutService } from './game-state-shortcut.service';
import { CardProperty } from '../../../classes/card-property';


@Injectable()
export class GameLoopService {

  private cardPropertyList$ = this.database.cardPropertyList$.first();


  private myIndex$ = this.gameRoomService.myIndex$;

  private turnPlayerIndex$ = this.gameStateService.turnPlayerIndex$;

  private isMyTurn$
    = Observable.combineLatest(
        this.turnPlayerIndex$, this.myIndex$, (a, b) => a === b )
      .distinctUntilChanged();

  private myName$: Observable<string>
   = Observable.combineLatest(
        this.myIndex$,
        this.gameRoomService.myGameRoom$.map( e => e.playersNameShuffled() ),
        (myIndex, playerNameList) => playerNameList[ myIndex ] || '' )
      .distinctUntilChanged();


  private gameSnapshot$ = this.gameStateService.gameSnapshot$;
  private initializeDone$ = this.gameStateService.loadMovesDone$;


  // 自分のターンでかつ初期化が完了した状態でのみphaseを出力
  // 自分のターンでないときは空文字を出力
  private myTurnPhase$ = Observable.combineLatest(
      this.gameStateService.phase$,
      this.isMyTurn$,
      this.initializeDone$.filter( e => e === true ),
      this.cardPropertyList$,
      (phase, isMyTurn, _1, _2) => ( isMyTurn ? phase : '' ) )
    .distinctUntilChanged();

  private gameValues$ = Observable.combineLatest(
      this.myIndex$,
      this.gameSnapshot$,
      this.cardPropertyList$ );

  private isStartOfMyTurn$   = this.myTurnPhase$.map( phase => phase === 'StartOfTurn').distinctUntilChanged();
  private isMyActionPhase$   = this.myTurnPhase$.map( phase => phase === 'Action'     ).distinctUntilChanged();
  private isMyActionXPhase$  = this.myTurnPhase$.map( phase => phase === 'Action*'    ).distinctUntilChanged();
  private isMyBuyPlayPhase$  = this.myTurnPhase$.map( phase => phase === 'BuyPlay'    ).distinctUntilChanged();
  private isMyBuyPlayXPhase$ = this.myTurnPhase$.map( phase => phase === 'BuyPlay*'   ).distinctUntilChanged();
  private isMyBuyCardPhase$  = this.myTurnPhase$.map( phase => phase === 'BuyCard'    ).distinctUntilChanged();
  private isMyNightPhase$    = this.myTurnPhase$.map( phase => phase === 'Night'      ).distinctUntilChanged();
  private isMyCleanUpPhase$  = this.myTurnPhase$.map( phase => phase === 'CleanUp'    ).distinctUntilChanged();
  private isEndOfMyTurn$     = this.myTurnPhase$.map( phase => phase === 'EndOfTurn'  ).distinctUntilChanged();
  private isMyActionPhase
    = this.myTurnPhase$.map( phase => ['BuyPlay', 'BuyCard'].includes( phase ) ).distinctUntilChanged();


  // isMy~~Phaseはfalseで開始するのでOnEndはprev === true のときのみ発火するように

  private startOfMyTurn$
    = this.isStartOfMyTurn$.filter( e => e === true )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myActionPhaseOnBegin$
    = this.isMyActionPhase$.filter( e => e === true )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myActionPhaseOnEnd$
    = this.isMyActionPhase$.pairwise().filter( ([prev, curr]) => prev === true && curr === false )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myBuyPlayPhaseOnBegin$
    = this.isMyBuyPlayPhase$.filter( e => e === true )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myBuyPlayPhaseOnEnd$
    = this.isMyBuyPlayPhase$.pairwise().filter( ([prev, curr]) => prev === true && curr === false )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myBuyCardPhaseOnBegin$
    = this.isMyBuyCardPhase$.filter( e => e === true )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myBuyCardPhaseOnEnd$
    = this.isMyBuyCardPhase$.pairwise().filter( ([prev, curr]) => prev === true && curr === false )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myNightPhaseOnBegin$
    = this.isMyNightPhase$.filter( e => e === true )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myNightPhaseOnEnd$
    = this.isMyNightPhase$.pairwise().filter( ([prev, curr]) => prev === true && curr === false )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private myCleanUpPhaseOnBegin$
    = this.isMyCleanUpPhase$.filter( e => e === true )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );
  private endOfMyTurn$
    = this.isEndOfMyTurn$.filter( e => e === true )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );


  private myHandCards$
    = this.gameStateService.myCards$.map( e => e.HandCards )
        .distinctUntilChanged( (x, y) => x.length === y.length );

  private myHandCardsChangeInMyActionPhase$
    = Observable.combineLatest( this.isMyActionPhase$, this.myHandCards$ )
        .filter( ([isMyActionPhase, _]) => isMyActionPhase )
        .map( ([_, myHandCards]) => myHandCards )
      .withLatestFrom( this.gameValues$ );

  private myHandCardsChangeInMyBuyPlayPhase$
    = Observable.combineLatest( this.isMyBuyPlayPhase$, this.myHandCards$ )
        .filter( ([isMyBuyPlayPhase, _]) => isMyBuyPlayPhase )
        .map( ([_, myHandCards]) => myHandCards )
      .withLatestFrom( this.gameValues$ );

  private myHandCardsChangeInMyNightPhase$
    = Observable.combineLatest( this.isMyNightPhase$, this.myHandCards$ )
        .filter( ([isMyNightPhase, _]) => isMyNightPhase )
        .map( ([_, myHandCards]) => myHandCards )
      .withLatestFrom( this.gameValues$ );


  private ActionChangeInMyActionPhase$
    = Observable.combineLatest(
          this.isMyActionPhase,
          this.gameStateService.action$ )
        .filter( ([isMyActionPhase, _]) => isMyActionPhase )
        .map( ([_, action]) => action )
        .distinctUntilChanged();

  private BuyChangeInMyBuyPhase$
    = Observable.combineLatest(
          this.isMyActionPhase,
          this.gameStateService.buy$ )
        .filter( ([isMyBuyPhase, _]) => isMyBuyPhase )
        .map( ([_, buy]) => buy )
        .distinctUntilChanged();

  private CoinOrSupplyChangeInMyBuyPhase$
    = Observable.combineLatest(
          this.isMyActionPhase,
          this.gameStateService.coin$,
          this.gameStateService.KingdomCards$.map( e => e.getDCards().length ).distinctUntilChanged(),
          this.gameStateService.BasicCards$  .map( e => e.getDCards().length ).distinctUntilChanged() )
        .filter( ([isMyBuyPhase, ]) => isMyBuyPhase )
        .map( ([_, coin, ]) => coin )
      .withLatestFrom( this.gameValues$ );

  private MyBuyPhaseOnEnd$
    = this.isMyActionPhase.pairwise().filter( ([prev, curr]) => prev === true && curr === false )
        .withLatestFrom( this.gameValues$, (_, gameValues) => gameValues );




  constructor(
    private dialog: MatDialog,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private gameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameStateShortcut: GameStateShortcutService
  ) {

    // this.myTurnPhase$.subscribe( val => console.log('myTurnPhase$', val ) );
    // this.gameStateService.phase$.subscribe( val => console.log('phase$', val ) );
    // this.isMyBuyPlayPhase$.subscribe( val => console.log('isMyBuyPlayPhase$', val ) );
    // this.isMyBuyCardPhase$.subscribe( val => console.log('isMyBuyCardPhase$', val ) );
    // this.isMyBuyPhase$.subscribe( val => console.log('isMyBuyPhase$', val ) );

    const printObservableName = (...args) => {
      // console.log( ...args );
    };

    this.startOfMyTurn$.subscribe( gameSnapshot => {
      //// dialog
      this.gameStateShortcut.resetTurnInfo();
      // ターン始めに予約されたカード・持続カードの解決など
    });

    { // Action phase
      this.myHandCardsChangeInMyActionPhase$.combineLatest( this.ActionChangeInMyActionPhase$ )
      .subscribe( ([[myHandCards, [myIndex, snapshot, cardList]], action]) => {
        printObservableName('myHandCardsChangeInMyActionPhase');
        // if ( myActionCardsInHand.length === 0 ) {  // 手札にアクションカードが無いなら終了
        //   this.gameStateService.sendins.turnInfo.phase('BuyPlay');
        //   return;
        // }
        if ( action > 0 ) {
          // 手札のアクションカードをボタン化
          this.gameStateShortcut.setButtonizationBy(
              myHandCards,
              [myIndex],
              dcard => cardList[ dcard.cardListIndex ].cardTypes.includes('Action') );
        } else {
          // ただし action <= 0 のときは手札のアクションカードを非ボタン化
          this.gameStateService.sendins.DCard.unbuttonizeCardsForPlayers(
              myHandCards.map( c => c.id ), [myIndex] );
        }
      });

      this.myActionPhaseOnEnd$.subscribe( ([myIndex, snapshot, cardList]) => {
        printObservableName('myActionPhaseOnEnd');
        // const myActionCardsInHand
        //   = snapshot.turnPlayerCards().HandCards
        //       .filter( e => cardList[ e.cardListIndex ].cardTypes.includes('Action') );
        this.gameStateService.sendins.DCard.unbuttonizeCardsForPlayers(
            snapshot.turnPlayerCards().HandCards.map( c => c.id ), [myIndex] );
      });
    }



    { // Buy phase
      { // BuyPlay phase
        this.myHandCardsChangeInMyBuyPlayPhase$
        .subscribe( ([myHandCards, [myIndex, snapshot, cardList]]) => {
          printObservableName('myHandCardsChangeInMyBuyPlayPhase');
          const myTreasureCardsInHand
            = myHandCards.filter( e => cardList[ e.cardListIndex ].cardTypes.includes('Treasure') );
          // if ( myTreasureCardsInHand.length === 0 ) {  // 手札に財宝カードが無いなら終了
          //   this.gameStateService.sendins.turnInfo.phase('BuyCard');
          //   return;
          // }
          this.gameStateService.sendins.DCard.buttonizeCardsForPlayers(
              myTreasureCardsInHand.map( c => c.id ), [myIndex] );
        });
        this.myBuyPlayPhaseOnEnd$.subscribe( ([myIndex, snapshot, cardList]) => {
          printObservableName('myBuyPlayPhaseOnEnd');
          this.gameStateShortcut.unbuttonizeTreasureInHand(
              snapshot, cardList, myIndex );
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
          const isTarget: (DCard) => boolean
            = (dcard: DCard) => (cardList[ dcard.cardListIndex ].cost.coin <= coin);
          this.gameStateShortcut.buttonizeSupply( snapshot, cardList, myIndex, isTarget );
        });

        this.MyBuyPhaseOnEnd$.subscribe( ([myIndex, snapshot, cardList]) => {
          printObservableName('MyBuyPhaseOnEnd');
          const isTarget: (DCard) => boolean = (dcard: DCard) => true;
          this.gameStateShortcut.unbuttonizeSupply( snapshot, cardList, myIndex, isTarget );
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


    this.endOfMyTurn$.subscribe( ([myIndex, snapshot, cardList]) => {
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
