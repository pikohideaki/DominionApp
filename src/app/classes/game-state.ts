import {
    permutation,
    shuffle,
    filterRemove,
    objectEntries,
    objectKeysAsNumber,
    seq0,
  } from '../my-own-library/utilities';

import { SelectedCards } from './selected-cards';
import { BlackMarketPileCard } from './black-market-pile-card';
import { CardProperty, numberToPrepare, toListIndex } from './card-property';



export class GameState {
  BasicCards   = new BasicCards();
  KingdomCards = new KingdomCards();
  playersCards = new PlayersCards();
  playerData   = new PlayerData();
  turnInfo     = new TurnInfo();
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

  constructor( initObj?: {
    VPtoken:    number,
    VPtotal:    number,
    TurnCount:  number,
  } ) {
    if ( !initObj ) return;
    this.VPtoken     = ( initObj.VPtoken     || 0 );
    this.VPtotal     = ( initObj.VPtotal     || 0 );
    this.TurnCount   = ( initObj.TurnCount   || 0 );
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


export type Phase = 'Action'|'Action*'|'Buy'|'Buy*'|'Night'|'CleanUp';

