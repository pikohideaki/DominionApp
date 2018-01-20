import { seq0 } from '../my-own-library/utilities';


export class GameState {
  turnCounter:    number       = 0;
  turnInfo:       TurnInfo     = new TurnInfo();
  allPlayersData: PlayerData[] = [];

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
    this.turnCounter = ( dataObj.turnCounter || 0 );
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
    if ( this.allPlayersData.length === 0 ) {
      this.allPlayersData = seq0( numberOfPlayers ).map( _ => new PlayerData() );
    }
    if ( this.DCards.allPlayersCards.length === 0 ) {
      this.DCards.allPlayersCards = seq0( numberOfPlayers ).map( _ => new PlayerCards() );
    }
  }
}



export type Phase = ''
                    |'Action'
                    |'Action*'
                    |'Buy'
                    |'Buy*'
                    |'BuyCard'
                    |'Night'
                    |'CleanUp';


export class DCard {  // Dominion card
  id:            number  = 0;
  cardListIndex: number  = 0;
  faceUp:        boolean[] = [];
  isButton:      boolean[] = [];
  rotation:      number  = 0;  // 0 - 360

  constructor( dataObj?: {
    id:            number,
    cardListIndex: number,
    faceUp:        boolean[],
    isButton:      boolean[],
    rotation:      number,
  } ) {
    if ( !dataObj ) return;
    this.id            = ( dataObj.id            || 0  );
    this.cardListIndex = ( dataObj.cardListIndex || 0  );
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
    this.Curse    = ( dataObj.Curse    || [] ).map( e => new DCard(e) );
    this.Copper   = ( dataObj.Copper   || [] ).map( e => new DCard(e) );
    this.Silver   = ( dataObj.Silver   || [] ).map( e => new DCard(e) );
    this.Gold     = ( dataObj.Gold     || [] ).map( e => new DCard(e) );
    this.Estate   = ( dataObj.Estate   || [] ).map( e => new DCard(e) );
    this.Duchy    = ( dataObj.Duchy    || [] ).map( e => new DCard(e) );
    this.Province = ( dataObj.Province || [] ).map( e => new DCard(e) );
    this.Platinum = ( dataObj.Platinum || [] ).map( e => new DCard(e) );
    this.Colony   = ( dataObj.Colony   || [] ).map( e => new DCard(e) );
    this.Potion   = ( dataObj.Potion   || [] ).map( e => new DCard(e) );
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
    this.Deck        = ( dataObj.Deck        || [] ).map( e => new DCard(e) );
    this.DiscardPile = ( dataObj.DiscardPile || [] ).map( e => new DCard(e) );
    this.HandCards   = ( dataObj.HandCards   || [] ).map( e => new DCard(e) );
    this.PlayArea    = ( dataObj.PlayArea    || [] ).map( e => new DCard(e) );
    this.Aside       = ( dataObj.Aside       || [] ).map( e => new DCard(e) );
    this.Open        = ( dataObj.Open        || [] ).map( e => new DCard(e) );
  }
}


export class PlayerData {
  VPtoken:    number = 0;
  // VPtotal:    number = 0;
  // turnCount:  number = 0;

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
  action: number = 0;
  buy:    number = 0;
  coin:   number = 0;

  constructor( dataObj?: {
    phase:  Phase,
    action: number,
    buy:    number,
    coin:   number,
  } ) {
    if ( !dataObj ) return;
    this.phase  = ( dataObj.phase  || '' );
    this.action = ( dataObj.action || 0  );
    this.buy    = ( dataObj.buy    || 0  );
    this.coin   = ( dataObj.coin   || 0  );
  }
}
