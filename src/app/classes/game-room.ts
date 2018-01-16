import { Observable } from 'rxjs/Rx';

import {
    permutation,
    shuffle,
    filterRemove,
    objectMap,
    objectKeysAsNumber,
    seq0,
  } from '../my-own-library/utilities';

import { SelectedCards } from './selected-cards';
import { BlackMarketPileCard } from './black-market-pile-card';
import { CardProperty, numberToPrepare, toListIndex } from './card-property';


export class GameRoom {
  // set mannually
  numberOfPlayers:      number = 2;
  memo:                 string = '';
  isSelectedExpansions: boolean[] = [];

  // set automatically
  databaseKey:    string;
  gameStateID:    string;
  date:           Date = new Date( Date.now() );
  playerShuffler: number[] = [];
  playersName:    string[] = [];
  selectedCards:  SelectedCards = new SelectedCards();
  initialState: {
    BasicCards: BasicCards,
    KingdomCards: KingdomCards,
    playersCards: PlayersCards[],
    BlackMarketPileShuffled: BlackMarketPileCard[],
  } = {
    BasicCards: new BasicCards(),
    KingdomCards: new KingdomCards(),
    playersCards: [],
    BlackMarketPileShuffled: [],
  };


  constructor( databaseKey?: string, dataObj?: {
      numberOfPlayers:      number,
      memo:                 string,
      isSelectedExpansions: boolean[],
      gameStateID:          string,
      timeStamp:            number,
      playerShuffler:       number[],
      playersName:          string[],
      selectedCards:        SelectedCards,
      initialState:         {
        BasicCards: BasicCards,
        KingdomCards: KingdomCards,
        playersCards: PlayersCards[],
        BlackMarketPileShuffled: BlackMarketPileCard[],
      }
    }
  ) {
    this.databaseKey = ( databaseKey || '' );

    if ( !dataObj ) return;
    this.numberOfPlayers      = ( dataObj.numberOfPlayers || 0 );
    this.memo                 = ( dataObj.memo || '' );
    this.isSelectedExpansions = ( dataObj.isSelectedExpansions || [] );

    this.gameStateID    = ( dataObj.gameStateID || '' );
    this.date           = new Date( dataObj.timeStamp || Date.now() );
    this.playerShuffler = ( dataObj.playerShuffler || seq0( this.numberOfPlayers ) );
    this.playersName    = objectMap( dataObj.playersName, key => dataObj.playersName[key] );
    this.selectedCards  = new SelectedCards( dataObj.selectedCards );
    this.initialState   = ( dataObj.initialState || {
      BasicCards: new BasicCards(),
      KingdomCards: new KingdomCards(),
      playersCards: seq0( this.numberOfPlayers ).map( _ => new PlayersCards() ),
      BlackMarketPileShuffled: [],
    } );
  }

  waitingForNewPlayers(): boolean {
    return this.playersName.length !== this.numberOfPlayers;
  }

  initSelectedCards() {

  }

  initCards( cardPropertyList: CardProperty[] ) {
    let serialNumber = 0;

    const addCard = ( cardPropIndex: number, placePath: (string|number)[] ) => {
      const id = serialNumber++;

      let ref: any = this.initialState;
      for ( let i = 0; i < placePath.length; ++i ) {
        ref = ref[placePath[i]];
      }
      ref.push( { id: id, cardPropIndex: cardPropIndex } );
    };

    const addMultipleCards = ( placePath: (string|number)[], cardListIndex: number ) => {
        const N = numberToPrepare(
                    cardPropertyList,
                    cardListIndex,
                    this.numberOfPlayers,
                    this.selectedCards.DarkAges );
        for ( let i = 0; i < N; ++i ) {
          addCard( cardListIndex, placePath );
        }
      };

    const usePotion = () => false;

    const toCardPropIndex = ( cardID: string ) => toListIndex( cardPropertyList, cardID );

    // basic cards
    addMultipleCards( ['BasicCards', 'Curse'   ], toCardPropIndex('Curse'   ) );
    addMultipleCards( ['BasicCards', 'Copper'  ], toCardPropIndex('Copper'  ) );
    addMultipleCards( ['BasicCards', 'Silver'  ], toCardPropIndex('Silver'  ) );
    addMultipleCards( ['BasicCards', 'Gold'    ], toCardPropIndex('Gold'    ) );
    addMultipleCards( ['BasicCards', 'Estate'  ], toCardPropIndex('Estate'  ) );
    addMultipleCards( ['BasicCards', 'Duchy'   ], toCardPropIndex('Duchy'   ) );
    addMultipleCards( ['BasicCards', 'Province'], toCardPropIndex('Province') );
    if ( this.selectedCards.Prosperity ) {
      addMultipleCards( ['BasicCards', 'Platinum'], toCardPropIndex('Platinum') );
      addMultipleCards( ['BasicCards', 'Colony'  ], toCardPropIndex('Colony'  ) );
    }
    if ( usePotion() ) {
      addMultipleCards( ['BasicCards', 'Potion'  ], toCardPropIndex('Potion'  ) );
    }

    // KingdomCards
    this.selectedCards.KingdomCards10.forEach( (cardPropIndex, index) => {
      addMultipleCards( ['KingdomCards', index], cardPropIndex );
    });
  }

  initDecks() {
    this.initialState.playersCards.forEach( (playerCards, index) => {
      /* get 7 Coppers from supply */
      for ( let i = 0; i < 7; ++i ) {
        playerCards.Deck.push( this.initialState.BasicCards.Copper.pop() );
      }
      /* get 3 Estates from supply */
      for ( let i = 0; i < 3; ++i ) {
        playerCards.Deck.push( this.initialState.BasicCards.Estate.pop() );
      }

      shuffle( playerCards.Deck );

      for ( let i = 0; i < 5; ++i ) {
        playerCards.HandCards.push( playerCards.Deck.pop() );
      }

      // this.sortHandCards( index, cardpropertyList );
    });
  }
}






export class BasicCards {
  Curse:    number[] = [];
  Copper:   number[] = [];
  Silver:   number[] = [];
  Gold:     number[] = [];
  Estate:   number[] = [];
  Duchy:    number[] = [];
  Province: number[] = [];
  Platinum: number[] = [];
  Colony:   number[] = [];
  Potion:   number[] = [];

  constructor( initObj?: {
      Curse:    any[],
      Copper:   any[],
      Silver:   any[],
      Gold:     any[],
      Estate:   any[],
      Duchy:    any[],
      Province: any[],
      Platinum: any[],
      Colony:   any[],
      Potion:   any[],
  }) {
    if ( !initObj ) return;
    this.Curse    = ( objectKeysAsNumber( initObj.Curse    || {} ) || [] );
    this.Copper   = ( objectKeysAsNumber( initObj.Copper   || {} ) || [] );
    this.Silver   = ( objectKeysAsNumber( initObj.Silver   || {} ) || [] );
    this.Gold     = ( objectKeysAsNumber( initObj.Gold     || {} ) || [] );
    this.Estate   = ( objectKeysAsNumber( initObj.Estate   || {} ) || [] );
    this.Duchy    = ( objectKeysAsNumber( initObj.Duchy    || {} ) || [] );
    this.Province = ( objectKeysAsNumber( initObj.Province || {} ) || [] );
    this.Platinum = ( objectKeysAsNumber( initObj.Platinum || {} ) || [] );
    this.Colony   = ( objectKeysAsNumber( initObj.Colony   || {} ) || [] );
    this.Potion   = ( objectKeysAsNumber( initObj.Potion   || {} ) || [] );
  }
}


export class KingdomCards extends Array<number[]> {
  0: number[] = [];
  1: number[] = [];
  2: number[] = [];
  3: number[] = [];
  4: number[] = [];
  5: number[] = [];
  6: number[] = [];
  7: number[] = [];
  8: number[] = [];
  9: number[] = [];

  constructor( initObj?: any[][] ) {
    super();
    if ( !initObj ) return;
    for ( let i = 0; i < 10; ++i ) {
      this[i] = ( objectKeysAsNumber( initObj[i] || {} ) || [] );
    }
  }
}


export class PlayersCards {
  Deck:        number[] = [];
  DiscardPile: number[] = [];
  HandCards:   number[] = [];
  PlayArea:    number[] = [];
  Aside:       number[] = [];
  Open:        number[] = [];

  constructor( initObj?: {
    Deck:        any[],
    DiscardPile: any[],
    HandCards:   any[],
    PlayArea:    any[],
    Aside:       any[],
    Open:        any[],
  } ) {
    if ( !initObj ) return;
    this.Deck        = ( objectKeysAsNumber( initObj.Deck        || {} ) || [] );
    this.DiscardPile = ( objectKeysAsNumber( initObj.DiscardPile || {} ) || [] );
    this.HandCards   = ( objectKeysAsNumber( initObj.HandCards   || {} ) || [] );
    this.PlayArea    = ( objectKeysAsNumber( initObj.PlayArea    || {} ) || [] );
    this.Aside       = ( objectKeysAsNumber( initObj.Aside       || {} ) || [] );
    this.Open        = ( objectKeysAsNumber( initObj.Open        || {} ) || [] );
  }
}



export class PlayerData {
  VPtoken:    number  = 0;
  VPtotal:    number  = 0;
  TurnCount:  number  = 0;
  Connection: boolean = true;


  constructor( initObj?: {
    VPtoken:    number,
    VPtotal:    number,
    TurnCount:  number,
    Connection: boolean,
  } ) {
    if ( !initObj ) return;
    this.VPtoken     = ( initObj.VPtoken     || 0 );
    this.VPtotal     = ( initObj.VPtotal     || 0 );
    this.TurnCount   = ( initObj.TurnCount   || 0 );
    this.Connection  = ( initObj.Connection  || false );
  }
}



export class TurnInfo {
  action: number = 0;
  buy:    number = 0;
  coin:   number = 0;
  phase:  string = '';

  constructor( initObj?: {
    action: number,
    buy:    number,
    coin:   number,
    phase:  string,
  } ) {
    if ( !initObj ) return;
    this.action = ( initObj.action || 0  );
    this.buy    = ( initObj.buy    || 0  );
    this.coin   = ( initObj.coin   || 0  );
    this.phase  = ( initObj.phase  || '' );
  }
}



export class CommonCardData$$ {
  cardListIndex$: Observable<number[]>;
}

export class CommonCardData {
  cardListIndex: number[]  = [];

  constructor( initObj?: {
    cardListIndex: number[],
  }) {
    if ( !initObj ) return;
    this.cardListIndex = ( initObj.cardListIndex || [] );
  }
}

export class CardDataForPlayer$$ {
  faceUp$:   Observable<boolean[]>;
  isButton$: Observable<boolean[]>;
}

export class CardDataForPlayer {
  faceUp:   boolean[] = [];
  isButton: boolean[] = [];

  constructor( initObj?: {
      faceUp:   boolean[],
      isButton: boolean[],
  }) {
    if ( !initObj ) return;
    this.faceUp   = ( initObj.faceUp   || [] );
    this.isButton = ( initObj.isButton || [] );
  }
}
