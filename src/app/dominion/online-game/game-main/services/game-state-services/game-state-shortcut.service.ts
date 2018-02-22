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
  } from '../../../../../classes/game-state';
import { CardProperty, CardType } from '../../../../../classes/card-property';
import { UserInput } from '../../../../../classes/game-room-communication';

import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameStateService } from './game-state.service';
import { MyGameRoomService } from '../my-game-room.service';
import { GameMessageService } from '../game-message.service';


@Injectable()
export class GameStateShortcutService {

  constructor(
    private utils: UtilitiesService,
    private gameStateService: GameStateService,
    private messageService: GameMessageService
  ) {
  }



  nextPhase( currentPhase: Phase ) {
    switch (currentPhase) {
      case ''            : return 'StartOfTurn';
      case 'StartOfTurn' : return 'Action';
      case 'Action'      : return 'BuyPlay';
      case 'Action*'     : return 'BuyPlay';
      case 'BuyPlay'     : return 'Night';
      case 'BuyPlay*'    : return 'Night';
      case 'BuyCard'     : return 'Night';
      case 'Night'       : return 'CleanUp';
      case 'CleanUp'     : return 'EndOfTurn';
      case 'EndOfTurn'   : return '';
      case 'GameIsOver'  : return 'GameIsOver';
      default            : return currentPhase;
    }
  }


  sortHandCards( gameState: GameState, playerId: number ) {
    gameState.DCards.allPlayersCards[ playerId ].sortHandCards();
  }

  async playAllTreasures(
    gameState: GameState,
    playerId: number,
    shuffleBy: number[],
    showMessage: boolean = true
  ) {
    const basicTreasures
      = gameState.DCards.allPlayersCards[ playerId ].HandCards
          .filter( d => d.cardProperty.isBasicTreasure() );

    if ( showMessage ) {
      this.messageService.pushMessage(
        `（${basicTreasures.map( e => e.cardProperty.nameJp ).join('、')}）をプレイしました。`);
    }
    for ( const d of basicTreasures ) {
      await this.playCard( d, playerId, gameState, shuffleBy, false );
    }
  }



  faceUp( dcards: DCard[] ) {
    dcards.forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = true ) );
  }
  faceDown( dcards: DCard[] ) {
    dcards.forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = false ) );
  }
  buttonize( dcards: DCard[] ) {
    dcards.forEach( c => c.isButton.forEach( (_, i, ar) => ar[i] = true ) );
  }
  unbuttonize( dcards: DCard[] ) {
    dcards.forEach( c => c.isButton.forEach( (_, i, ar) => ar[i] = false ) );
  }


  buttonizeForTurnPlayer( dcards: DCard[], gameState: GameState ) {
    const pid = gameState.turnPlayerIndex();
    dcards.forEach( d => d.isButton[ pid ] = true );
  }


  buttonizeIf( dcards: DCard[], playerId: number, classifier: (c: DCard) => boolean ) {
    dcards.filter( c => classifier(c) )
          .forEach( c => c.isButton[playerId] = true );
    dcards.filter( c => !classifier(c) )
          .forEach( c => c.isButton[playerId] = false );
  }

  buttonizeSupplyIf(
    gameState: GameState,
    playerId: number,
    condition: (Dcard) => boolean
  ) {
    const topCards
      = [].concat(
            this.utils.objectMap( gameState.DCards.BasicCards, e => e[0] ),
            gameState.DCards.KingdomCards.map( pile => pile[0] )
          )
          .filter( c => c !== undefined );
    this.buttonizeIf( topCards, playerId, condition );
  }

  resetDCardsAttributes( gameState: GameState ) {
    // ボタン化解除
    gameState.getAllDCards().forEach( c =>
        c.isButton.forEach( (_, i) => c.isButton[i] = false ) );

    // サプライは表に
    [].concat(
      gameState.DCards.BasicCards.getDCards(),
      gameState.DCards.KingdomCards.getDCards(),
      gameState.DCards.trashPile
    ).forEach( c => {
      c.faceUp.forEach( (_, i, ar) => ar[i] = true );
    });
    // 山札は裏に
    gameState.DCards.allPlayersCards.forEach( playerCards => {
      playerCards.Deck
        .forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = false ) );
    });
    // 場・捨て山は表に
    gameState.DCards.allPlayersCards.forEach( playerCards => {
      [].concat( playerCards.DiscardPile, playerCards.PlayArea )
        .forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = true ) );
    });
    // 手札は自分にのみ表に
    gameState.DCards.allPlayersCards.forEach( (playerCards, id) => {
      playerCards.HandCards
        .forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = i === id ) );
    });
  }



  private async draw1Card( gameState: GameState, playerId: number, shuffleBy: number[] ) {
    const playerCards = gameState.DCards.allPlayersCards[ playerId ];
    if ( playerCards.Deck.length + playerCards.DiscardPile.length < 1 ) return;  // 引くカードが無い場合

    this.gameStateService.setGameState( gameState );
    if ( playerCards.Deck.length < 1 ) {
      const shuffleBy_adjusted
        = shuffleBy.filter( e => e < playerCards.DiscardPile.length );
      playerCards.Deck = playerCards.DiscardPile.map(
            (_, i) => playerCards.DiscardPile[ shuffleBy_adjusted[i] ] );
      playerCards.DiscardPile = [];
      this.faceDown( playerCards.Deck );
      await this.utils.sleep( 0.1 );
      this.gameStateService.setGameState( gameState );
    }
    playerCards.HandCards.push( playerCards.Deck.pop() );
    await this.utils.sleep( 0.1 );
    this.gameStateService.setGameState( gameState );
  }

  async drawCards(
    n: number,
    gameState: GameState,
    playerId: number,
    shuffleBy: number[],
    showMessage: boolean = true
  ) {
    if ( n <= 0 ) return;
    if ( showMessage ) {
      this.messageService.pushMessage(`${n}枚カードを引きました。`);
    }
    for ( let i = 0; i < n; ++i ) {
      await this.draw1Card( gameState, playerId, shuffleBy );
    }
    this.faceUp( gameState.DCards.allPlayersCards[ playerId ].HandCards );
  }


  async playCard(
    dcard: DCard,
    playerId: number,
    gameState: GameState,
    shuffleBy: number[],
    showMessage: boolean = true
  ) {
    if ( showMessage ) {
      this.messageService.pushMessage(`${dcard.cardProperty.nameJp}をプレイしました。`);
    }
    gameState.removeDCards([dcard.id]);
    gameState.DCards.allPlayersCards[ playerId ].PlayArea.push( dcard );
    this.faceUp([dcard]);
    this.unbuttonize([dcard]);
    await this.getCardEffect( dcard, playerId, gameState, shuffleBy );
  }

  gainCard(
    dcard: DCard,
    playerId: number,
    gameState: GameState,
    showMessage: boolean = true
  ) {
    if ( showMessage ) {
      this.messageService.pushMessage(`${dcard.cardProperty.nameJp}を獲得しました。`);
    }
    gameState.removeDCards([dcard.id]);
    gameState.DCards.allPlayersCards[ playerId ].DiscardPile.push( dcard );
    this.unbuttonize([dcard]);
  }

  buyCard(
    dcard: DCard,
    playerId: number,
    gameState: GameState,
    showMessage: boolean = true
  ) {
    if ( showMessage ) {
      this.messageService.pushMessage(`${dcard.cardProperty.nameJp}を購入しました。`);
    }
    gameState.turnInfo.buy  -= 1;
    gameState.turnInfo.coin -= dcard.cardProperty.cost.coin;
    this.gainCard( dcard, playerId, gameState, false );
  }

  discard(
    dcards: DCard[],
    playerId: number,
    gameState: GameState,
    showMessage: boolean = true
  ) {
    if ( showMessage ) {
      this.messageService.pushMessage(`${dcards.length}枚捨て札にしました。`);
    }
    gameState.removeDCards( dcards.map( c => c.id ) );
    const playerCards = gameState.DCards.allPlayersCards[ playerId ];
    playerCards.DiscardPile.push( ...dcards );
  }

  async cleanUp( gameState: GameState, playerId: number, shuffleBy: number[] ) {
    // 場と手札のカードを捨て札に
    await this.utils.sleep( 0.1 );
    const playerCards = gameState.DCards.allPlayersCards[ playerId ];
    this.discard(
      [].concat( playerCards.HandCards, playerCards.PlayArea ),
      playerId, gameState, false );
    // 手札に5枚カードを引く
    await this.drawCards( 5, gameState, playerId, shuffleBy, false );
  }


  async onCardClick( gameState: GameState, userInput: UserInput ) {
    const playerId    = userInput.data.playerId;
    const shuffleBy   = userInput.data.shuffleBy;
    const clickedCard = gameState.getDCard( userInput.data.clickedCardId );
    const dir         = gameState.getDirectory( userInput.data.clickedCardId );

    switch ( gameState.turnInfo.phase ) {
      case 'Action': // アクションカードの通常の使用
        await this.playCard( clickedCard, playerId, gameState, userInput.data.shuffleBy );
        gameState.turnInfo.action -= 1;
        break;

      case 'Action*':
        // アクションカードの通常以外の使用，選択したカードの獲得
        break;

      case 'BuyPlay':
        if ( dir[0] === 'allPlayersCards' && dir[1] === playerId && dir[2] === 'HandCards' ) {
          // 財宝カードの通常の使用
          await this.playCard( clickedCard, playerId, gameState, userInput.data.shuffleBy );
        }
        if ( dir[0] === 'BasicCards' || dir[0] === 'KingdomCards' ) {
          // カードの購入
          gameState.turnInfo.phase = 'BuyCard';
          this.buyCard( clickedCard, playerId, gameState );
        }
        break;

      case 'BuyPlay*': // 財宝カードの通常以外の使用
        break;

      case 'BuyCard': // サプライなどからのカードの購入
        this.buyCard( clickedCard, playerId, gameState );
        break;

      case 'Night': // Nightカードの使用
        await this.playCard( clickedCard, playerId, gameState, userInput.data.shuffleBy );
        break;

      default:
        break;
    }

  }


  private async getCardEffect(
    dcard: DCard,
    playerId: number,
    gameState: GameState,
    shuffleBy: number[],
  ) {
    const cardProp = dcard.cardProperty;
    gameState.turnInfo.action += cardProp.action;
    gameState.turnInfo.buy    += cardProp.buy;
    gameState.turnInfo.coin   += cardProp.coin;
    await this.drawCards( cardProp.drawCard, gameState, playerId, shuffleBy );
    // this.**service.getAdditionalEffect( dcard, snapshot, cardList )
  }






}