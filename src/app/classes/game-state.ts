import { seq0, objectEntries, permutation, objectForEach, filterRemove } from '../my-own-library/utilities';
import { CardProperty, CardType } from './card-property';


export function getDCardsByIdArray( idArray: (number[]|void), dcards: DCard[] ): DCard[] {
  // cardIdArrayの順番で取得
  if ( !idArray ) return dcards;
  return idArray.map( id => dcards.find( c => c.id === id ) ).filter( e => e !== undefined );
}



export class GameState {
  turnCounter:     number = 0;
  numberOfPlayers: number = 0;

  turnInfo:        TurnInfo     = new TurnInfo();
  allPlayersData:  PlayerData[] = [];

  DCards: {
    allPlayersCards: PlayerCards[],
    BasicCards:      BasicCards,
    KingdomCards:    KingdomCards,
    trashPile:       DCard[],
    BlackMarketPile: DCard[],
  } = {
    allPlayersCards: [],
    BasicCards:      new BasicCards(),
    KingdomCards:    new KingdomCards(),
    trashPile:       [],
    BlackMarketPile: [],
  };


  constructor( dataObj?: {
    turnCounter:     number,
    numberOfPlayers: number,
    turnInfo:        TurnInfo,
    allPlayersData:  PlayerData[],
    DCards: {
      allPlayersCards: PlayerCards[],
      BasicCards:      BasicCards,
      KingdomCards:    KingdomCards,
      trashPile:       DCard[],
      BlackMarketPile: DCard[],
    }
  }) {
    if ( !dataObj ) return;
    this.turnCounter     = ( dataObj.turnCounter     || 0 );
    this.numberOfPlayers = ( dataObj.numberOfPlayers || 0 );

    this.turnInfo = new TurnInfo( dataObj.turnInfo );
    this.allPlayersData = ( dataObj.allPlayersData || [] ).map( e => new PlayerData(e) );
    if ( !dataObj.DCards ) return;
    this.DCards.allPlayersCards = ( dataObj.DCards.allPlayersCards || [] ).map( e => new PlayerCards(e) );
    this.DCards.BasicCards      = new BasicCards  ( dataObj.DCards.BasicCards );
    this.DCards.KingdomCards    = new KingdomCards( dataObj.DCards.KingdomCards );
    this.DCards.trashPile       = ( dataObj.DCards.trashPile       || [] ).map( e => new DCard(e) );
    this.DCards.BlackMarketPile = ( dataObj.DCards.BlackMarketPile || [] ).map( e => new DCard(e) );
  }

  setNumberOfPlayers( numberOfPlayers: number ) {
    this.numberOfPlayers = numberOfPlayers;
    if ( this.allPlayersData.length === 0 ) {
      this.allPlayersData = seq0( numberOfPlayers ).map( _ => new PlayerData() );
    }
    if ( this.DCards.allPlayersCards.length === 0 ) {
      this.DCards.allPlayersCards = seq0( numberOfPlayers ).map( _ => new PlayerCards() );
    }
  }

  turnPlayerIndex() {
    return (this.turnCounter % this.numberOfPlayers) || 0;
  }

  nextTurnPlayerIndex() {
    return ((this.turnCounter + 1) % this.numberOfPlayers) || 0;
  }

  turnPlayerCards() {
    return this.DCards.allPlayersCards[ this.turnPlayerIndex() ];
  }


  getDirectory( cardId: number ): DCardPath[] {
    let result: DCardPath[];
    this.DCards.allPlayersCards.forEach( (playerCards, playerIndex) =>
      objectForEach( playerCards, (pile, key: PlayerCardDirectory ) => {
        if ( pile.map( c => c.id ).includes( cardId ) ) {
          result = ['allPlayersCards', playerIndex, key];
        }
      }) );

    objectForEach( this.DCards.BasicCards, (pile, key: BasicCardsDirectory) => {
      if ( pile.map( c => c.id ).includes( cardId ) ) {
        result = ['BasicCards', key];
      }
    });

    if ( this.DCards.BlackMarketPile.map( c => c.id ).includes( cardId ) ) {
      result = ['BlackMarketPile'];
    }

    this.DCards.KingdomCards.forEach( (pile, index) => {
      if ( pile.map( c => c.id ).includes( cardId ) ) {
        result = ['KingdomCards', index];
      }
    });

    if ( this.DCards.trashPile.map( c => c.id ).includes( cardId ) ) {
      result = ['trashPile'];
    }

    return result;
  }


  getAllPlayersCards() {
    return [].concat(
      ...this.DCards.allPlayersCards.map( pl => pl.getDCards() ) );
  }

  getAllDCards(): DCard[] {
    return [].concat(
        this.getAllPlayersCards(),
        this.DCards.BasicCards.getDCards(),
        this.DCards.KingdomCards.getDCards(),
        this.DCards.trashPile,
        this.DCards.BlackMarketPile );
  }

  isEmpty() {
    return ( this.getAllDCards().length === 0 );
  }


  getDCards( cardIdArray: number[] ): DCard[] {
    return getDCardsByIdArray( cardIdArray, this.getAllDCards() );
  }

  getDCard( cardId: number ): DCard {
    return ( this.getDCards([cardId])[0] || new DCard() );
  }

  removeDCards( cardIdArray: number[] ) {
    this.DCards.allPlayersCards.forEach( pl => pl.removeDCards( cardIdArray ) );
    this.DCards.BasicCards.removeDCards( cardIdArray );
    this.DCards.KingdomCards.removeDCards( cardIdArray );
    this.DCards.trashPile
      = this.DCards.trashPile.filter( c => !cardIdArray.includes(c.id) );
    this.DCards.BlackMarketPile
      = this.DCards.BlackMarketPile.filter( c => !cardIdArray.includes(c.id) );
  }

  emptyPiles( Prosperity: boolean, Alchemy: boolean = false ): number {
    const Supplies = [].concat(
        objectEntries( this.DCards.BasicCards ),
        this.DCards.KingdomCards );
    return Supplies.filter( e => e.length <= 0 ).length
            - (Prosperity ? 0 : 2)
            - (Alchemy ? 0 : 1);
  }

  gameIsOverConditions( Prosperity: boolean ): boolean {
    // 使用しているサプライが3山なくなったら終了
    /* [ToDo] 闇市場，廃墟などもカウント */
    return ( this.DCards.BasicCards.Province.length <= 0
        || (Prosperity && this.DCards.BasicCards.Colony.length <= 0)
        || this.emptyPiles( Prosperity ) >= 3 );
  }

  gameIsOver( Prosperity: boolean ): boolean {
    if ( this.isEmpty() ) return false;
    return this.turnInfo.phase === 'GameIsOver'
            && this.gameIsOverConditions( Prosperity );
  }


  disableAllButtons() {
    this.getAllDCards()
      .forEach( d => d.isButton.forEach( (_, i, ar) => ar[i] = false ) );
  }

}



export type Phase = ''
                    |'StartOfTurn'
                    |'Action'
                    |'Action*'
                    |'BuyPlay'
                    |'BuyPlay*'
                    |'BuyCard'
                    |'Night'
                    |'Night*'
                    |'CleanUp'
                    |'EndOfTurn'
                    |'GameIsOver';


export type PlayerCardDirectory = 'Deck'
                                 |'DiscardPile'
                                 |'HandCards'
                                 |'PlayArea'
                                 |'Aside'
                                 |'Open';

export type BasicCardsDirectory = 'Curse'
                                 |'Copper'
                                 |'Silver'
                                 |'Gold'
                                 |'Estate'
                                 |'Duchy'
                                 |'Province'
                                 |'Platinum'
                                 |'Colony'
                                 |'Potion';

export type DCardPath = number
                            |PlayerCardDirectory
                            |BasicCardsDirectory
                            |'allPlayersCards'
                            |'BasicCards'
                            |'KingdomCards'
                            |'trashPile'
                            |'BlackMarketPile'
                          ;



export class DCard {  // Dominion card
  cardProperty:  CardProperty = new CardProperty();
  id:            number  = 0;
  faceUp:        boolean[] = [];
  isButton:      boolean[] = [];
  rotation:      number  = 0;  // 0 - 360

  constructor( dataObj?: {
    cardProperty:  CardProperty,
    id:            number,
    faceUp:        boolean[],
    isButton:      boolean[],
    rotation:      number,
  } ) {
    if ( !dataObj ) return;
    this.cardProperty  = ( (new CardProperty()).from( dataObj.cardProperty ) || new CardProperty() );
    this.id            = ( dataObj.id            || 0  );
    this.faceUp        = ( dataObj.faceUp        || [] );
    this.isButton      = ( dataObj.isButton      || [] );
    this.rotation      = ( dataObj.rotation      || 0  );
  }
}


export class BasicCards {
  Curse:    DCard[] = [];
  Copper:   DCard[] = [];
  Silver:   DCard[] = [];
  Gold:     DCard[] = [];
  Estate:   DCard[] = [];
  Duchy:    DCard[] = [];
  Province: DCard[] = [];
  Platinum: DCard[] = [];
  Colony:   DCard[] = [];
  Potion:   DCard[] = [];

  constructor( dataObj?: {
    Curse:    DCard[],
    Copper:   DCard[],
    Silver:   DCard[],
    Gold:     DCard[],
    Estate:   DCard[],
    Duchy:    DCard[],
    Province: DCard[],
    Platinum: DCard[],
    Colony:   DCard[],
    Potion:   DCard[],
  } ) {
    if ( !dataObj ) return;
    objectForEach( dataObj, (_, key) => {
      this[key] = ( dataObj[key] || [] ).map( e => new DCard(e) );
    });
  }

  getDCards( cardIdArray?: number[] ): DCard[] {
    const allDCards: DCard[] = [].concat( ...objectEntries( this ) );
    return getDCardsByIdArray( cardIdArray, allDCards );
  }

  removeDCards( cardIdArray: number[] ) {
    objectForEach( this, (pile, key, obj) =>
      obj[key] = pile.filter( c => !cardIdArray.includes(c.id) ) );
  }

}

export class KingdomCards extends Array<DCard[]> {
  0: DCard[] = [];
  1: DCard[] = [];
  2: DCard[] = [];
  3: DCard[] = [];
  4: DCard[] = [];
  5: DCard[] = [];
  6: DCard[] = [];
  7: DCard[] = [];
  8: DCard[] = [];
  9: DCard[] = [];

  constructor( kingdomCards?: Array<DCard[]> ) {
    super();
    if ( !kingdomCards ) return;
    for ( let i = 0; i < 10; ++i ) {
      this[i] = ( kingdomCards[i] || [] ).map( e => new DCard(e) );
    }
  }

  // Arrayの拡張クラスではこの記法でないとメソッドが追加されない（？）
  getDCards = ( cardIdArray?: number[] ): DCard[] => {
    const allDCards: DCard[] = [].concat( ...[].concat( this ) );
    return getDCardsByIdArray( cardIdArray, allDCards );
  }

  removeDCards = ( cardIdArray: number[] ) => {
    this.forEach( (pile, key, obj) =>
      obj[key] = pile.filter( c => !cardIdArray.includes(c.id) ) );
  }

}

export class PlayerCards {
  Deck:        DCard[] = [];
  DiscardPile: DCard[] = [];
  HandCards:   DCard[] = [];
  PlayArea:    DCard[] = [];
  Aside:       DCard[] = [];
  Open:        DCard[] = [];

  constructor( dataObj?: {
    Deck:        DCard[],
    DiscardPile: DCard[],
    HandCards:   DCard[],
    PlayArea:    DCard[],
    Aside:       DCard[],
    Open:        DCard[],
  } ) {
    if ( !dataObj ) return;
    objectForEach( dataObj, (_, key) => {
      this[key] = ( dataObj[key] || [] ).map( e => new DCard(e) );
    });
  }


  sortByCardType( dcards: DCard[] ): DCard[] {
    let sorted = dcards.sort( (a, b) => a.cardProperty.no - b.cardProperty.no );
    let Actions, Treasures, Victories;
    const f = (type: CardType) => ((d: DCard) => d.cardProperty.cardTypes.includes(type));
    [Actions,   sorted] = filterRemove( sorted, f('Action')   );
    [Treasures, sorted] = filterRemove( sorted, f('Treasure') );
    [Victories, sorted] = filterRemove( sorted, f('Victory')  );
    return [].concat( Actions, Treasures, Victories, sorted );
  }

  sortHandCards() {
    this.HandCards = this.sortByCardType( this.HandCards );
  }


  getDCards( cardIdArray?: number[], sort: boolean = false ): DCard[] {
    const allDCards: DCard[] = [].concat( ...objectEntries( this ) );
    const dcards = getDCardsByIdArray( cardIdArray, allDCards );
    return ( sort ? this.sortByCardType( dcards ) : dcards );
  }

  removeDCards( cardIdArray: number[] ) {
    objectForEach( this, (pile, key, obj) =>
      obj[key] = pile.filter( c => !cardIdArray.includes(c.id) ) );
  }

}


export class PlayerData {
  VPtoken:    number = 0;
  // VPtotal:    number = 0;
  // turnCount:  number = 0;
  // debt
  // vcoin

  constructor( dataObj?: {
    VPtoken:   number,
    // VPtotal:   number,
    // turnCount: number,
  } ) {
    if ( !dataObj ) return;
    this.VPtoken   = ( dataObj.VPtoken   || 0 );
    // this.VPtotal   = ( dataObj.VPtotal   || 0 );
    // this.turnCount = ( dataObj.turnCount || 0 );
  }
}

export class TurnInfo {
  phase:  Phase  = '';
  action: number = 1;
  buy:    number = 1;
  coin:   number = 0;

  constructor( dataObj?: {
    phase:  Phase,
    action: number,
    buy:    number,
    coin:   number,
  } ) {
    if ( !dataObj ) return;
    this.phase  = ( dataObj.phase  || '' );
    this.action = ( dataObj.action || 1 );
    this.buy    = ( dataObj.buy    || 1 );
    this.coin   = ( dataObj.coin   || 0 );
  }
}
