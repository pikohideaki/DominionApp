import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import {
    GameState,
    DCard,
    BasicCards,
    KingdomCards,
    PlayerData,
    PlayerCards,
    TurnInfo,
    Phase,
  } from '../../../classes/game-state';
import { GameStateService } from './game-state.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { CardProperty } from '../../../classes/card-property';
import { MyGameRoomService } from './my-game-room.service';


@Injectable()
export class GameStateShortcutService {

  private clickedCardSource = new Subject<DCard>();
  private clickedCard$      = this.clickedCardSource.asObservable();
  private gameSnapshot$     = this.gameState.gameSnapshot$;
  private cardList$         = this.database.cardPropertyList$;
  private myIndex$          = this.gameRoom.myIndex$;


  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private gameState: GameStateService,
    private gameRoom: MyGameRoomService
  ) {
    this.clickedCard$.withLatestFrom( this.myIndex$, this.gameSnapshot$, this.cardList$ )
      .subscribe( ([clickedCard, myIndex, snapshot, cardList]) => {
        // console.log( clickedCard );
        switch ( snapshot.turnInfo.phase ) {
          case 'Action': // アクションカードの通常の使用
            this.playCard( clickedCard.id, myIndex );
            this.gameState.sendins.turnInfo.addAction(-1);
            this.getCardEffect( clickedCard, myIndex, snapshot, cardList );
            break;

          case 'Action*':
            // アクションカードの通常以外の使用，選択したカードの獲得
            break;

          case 'BuyPlay':
            if ( snapshot.getDirectory( clickedCard.id )[0] === 'allPlayersCards'
              && snapshot.getDirectory( clickedCard.id )[1] === myIndex
              && snapshot.getDirectory( clickedCard.id )[2] === 'HandCards'
            ) {  // 財宝カードの通常の使用
              this.playCard( clickedCard.id, myIndex );
              this.getCardEffect( clickedCard, myIndex, snapshot, cardList );
            }
            if ( snapshot.getDirectory( clickedCard.id )[0] === 'BasicCards'
              || snapshot.getDirectory( clickedCard.id )[0] === 'KingdomCards'
            ) {  // カードの購入
              this.gameState.sendins.turnInfo.phase('BuyCard');
              this.buyCard( clickedCard, myIndex, snapshot, cardList );
            }

            break;

          case 'BuyPlay*': // 財宝カードの通常以外の使用

          case 'BuyCard': // サプライなどからのカードの購入
            this.buyCard( clickedCard, myIndex, snapshot, cardList );
            break;

          case 'Night': // Nightカードの使用
            this.playCard( clickedCard.id, myIndex );
            this.getCardEffect( clickedCard, myIndex, snapshot, cardList );
            break;

          default:
            break;
        }
      });
  }


  // View 操作から
  onCardClicked( dcard: DCard ) {
    console.log( dcard );
    this.clickedCardSource.next( dcard );
  }



  resetTurnInfo() {
    this.gameState.sendins.turnInfo.action(1);
    this.gameState.sendins.turnInfo.buy(1);
    this.gameState.sendins.turnInfo.coin(0);
  }


  async goToNextPhase( currentPhase: Phase ) {
    let nextPhase: Phase;
    switch (currentPhase) {
      case 'StartOfTurn': nextPhase = 'Action';      break;
      case 'Action':      nextPhase = 'BuyPlay';     break;
      case 'Action*':     nextPhase = 'BuyPlay';     break;
      case 'BuyPlay':     nextPhase = 'Night';       break;
      case 'BuyPlay*':    nextPhase = 'Night';       break;
      case 'BuyCard':     nextPhase = 'Night';       break;
      case 'Night':       nextPhase = 'CleanUp';     break;
      case 'CleanUp':     nextPhase = 'EndOfTurn';   break;
      case 'EndOfTurn':   nextPhase = 'StartOfTurn'; break;
      default:            nextPhase = '';            break;
    }
    await this.gameState.sendins.turnInfo.phase( nextPhase );
  }

  async goToNextPlayer() {
    await this.gameState.sendins.incrementTurnCounter();
  }

  sortHandCards( snapshot: GameState, myIndex: number ) {
    const myHandCards = snapshot.DCards.allPlayersCards[ myIndex ].HandCards;
    const sortedId = this.utils.getSortedByKey( myHandCards, 'cardListIndex' ).map( c => c.id );
    this.gameState.sendins.DCard.moveCardsTo(
        sortedId, ['allPlayersCards', myIndex, 'HandCards'] );
  }



  /* カードのボタン化 */

  /**
   * @param targetArray dcards in this array are buttonized or unbuttonized
   * @param condition true -> buttonized, false -> unbuttonized
   */
  private buttonizeIf_sub(
    targetArray: DCard[],
    playerIds: number[],
    condition: (DCard) => boolean,
    buttonize: boolean
  ) {
    const toBeButtonized:   DCard[] = targetArray.filter( e => condition(e) === buttonize );
    const toBeUnButtonized: DCard[] = targetArray.filter( e => condition(e) !== buttonize );
    this.gameState.sendins.DCard.buttonizeCardsForPlayers(
        toBeButtonized.map( c => c.id ), playerIds );
    this.gameState.sendins.DCard.unbuttonizeCardsForPlayers(
        toBeUnButtonized.map( c => c.id ), playerIds );
  }
  buttonizeIf(
    targetArray: DCard[],
    playerIds: number[],
    condition: (DCard) => boolean
  ) {
    this.buttonizeIf_sub( targetArray, playerIds, condition, true );
  }
  unbuttonizeIf(
    targetArray: DCard[],
    playerIds: number[],
    condition: (DCard) => boolean
  ) {
    this.buttonizeIf_sub( targetArray, playerIds, condition, false );
  }



  buttonizeSupplyIf(
    snapshot: GameState,
    cardList: CardProperty[],
    myIndex: number,
    condition: (Dcard) => boolean
  ) {
    const topCards
      = [].concat(
            this.utils.objectMap( snapshot.DCards.BasicCards, e => e[0] ),
            snapshot.DCards.KingdomCards.map( pile => pile[0] )
          )
          .filter( c => c !== undefined );
    this.buttonizeIf( topCards, [myIndex], condition );
  }

  unbuttonizeSupply(
    snapshot: GameState,
    cardList: CardProperty[],
    myIndex: number
  ) {
    this.buttonizeSupplyIf( snapshot, cardList, myIndex, _ => false );
  }




  /* カードの移動操作 */

  discard( toDiscardPile: number[], myIndex: number ) {
    this.gameState.sendins.DCard.unbuttonizeCardsForPlayers(
        toDiscardPile, [myIndex] );
    this.gameState.sendins.DCard.moveCardsTo(
        toDiscardPile, ['allPlayersCards', myIndex, 'DiscardPile']);
  }


  playCard( cardId: number, myIndex: number ) {
    this.gameState.sendins.DCard.unbuttonizeCardsForPlayers(
        [cardId], [myIndex] );
    this.gameState.sendins.DCard.moveCardsTo(
        [cardId], ['allPlayersCards', myIndex, 'PlayArea'] );
  }


  buyCard(
    boughtCard: DCard,
    myIndex:    number,
    snapshot:   GameState,
    cardList:   CardProperty[]
  ) {
    this.gameState.sendins.turnInfo.addBuy(-1);
    this.gameState.sendins.turnInfo.addCoin( -cardList[boughtCard.cardListIndex].cost.coin );
    this.gameState.sendins.DCard.unbuttonizeCardsForPlayers(
        [boughtCard.id], [myIndex] );
    this.gameState.sendins.DCard.moveCardsTo(
        [boughtCard.id], ['allPlayersCards', myIndex, 'DiscardPile'] );
  }


  drawCards( numberOfCards: number, playerCards: PlayerCards, myIndex: number ) {
    if ( numberOfCards <= 0 ) return;
    if ( playerCards.Deck.length >= numberOfCards ) {
      // 山札が十分あるとき
      const cardsToDrawId = playerCards.Deck.slice( 0, numberOfCards ).map( c => c.id );
      this.gameState.sendins.DCard.moveCardsTo(
          cardsToDrawId, ['allPlayersCards', myIndex, 'HandCards'] );
      this.gameState.sendins.DCard.faceUpCardsForPlayers(
          cardsToDrawId, [myIndex] );
    } else {
      // まず山札をすべて手札に
      const DeckSize = playerCards.Deck.length;
      const cardsToDrawId = playerCards.Deck.map( c => c.id );
      this.gameState.sendins.DCard.moveCardsTo(
          cardsToDrawId, ['allPlayersCards', myIndex, 'HandCards'] );
      this.gameState.sendins.DCard.faceUpCardsForPlayers(
          cardsToDrawId, [myIndex] );

      // 捨て山を手札に引くカードと山札に分割
      const DiscardPileId = playerCards.DiscardPile.map( c => c.id );
      this.utils.shuffle( DiscardPileId );
      const cardsToDrawId2 = DiscardPileId.slice( 0, numberOfCards - DeckSize );
      const remaining = DiscardPileId.slice( numberOfCards - DeckSize );
      this.gameState.sendins.DCard.moveCardsTo(
          cardsToDrawId2, ['allPlayersCards', myIndex, 'HandCards'] );
      this.gameState.sendins.DCard.moveCardsTo(
          remaining, ['allPlayersCards', myIndex, 'Deck'] );
      this.gameState.sendins.DCard.faceDownCardsForPlayers(
          remaining, [myIndex] );
    }
  }






  getCardEffect(
    dcard: DCard,
    myIndex: number,
    snapshot: GameState,
    cardList: CardProperty[]
  ) {
    const cardProp = cardList[ dcard.cardListIndex ];
    this.gameState.sendins.turnInfo.addAction( cardProp.action );
    this.gameState.sendins.turnInfo.addBuy   ( cardProp.buy    );
    this.gameState.sendins.turnInfo.addCoin  ( cardProp.coin   );
    this.drawCards( cardProp.drawCard, snapshot.DCards.allPlayersCards[myIndex], myIndex );
    // this.**service.getAdditionalEffect( dcard, snapshot, cardList )
  }








}
