export class SelectedCards {
  Prosperity:       boolean  = false;
  DarkAges:         boolean  = false;
  KingdomCards10:   number[] = [];
  BaneCard:         number[] = [];
  EventCards:       number[] = [];
  LandmarkCards:    number[] = [];
  Obelisk:          number[] = [];
  BlackMarketPile:  number[] = [];


  constructor( initObj?: {
      Prosperity:       boolean,
      DarkAges:         boolean,
      KingdomCards10:   number[],
      BaneCard:         number[],
      EventCards:       number[],
      LandmarkCards:    number[],
      Obelisk:          number[],
      BlackMarketPile:  number[],
  }) {
    if ( !initObj ) return;
    this.Prosperity      = ( initObj.Prosperity      || false );
    this.DarkAges        = ( initObj.DarkAges        || false );
    this.KingdomCards10  = ( initObj.KingdomCards10  || [] );
    this.BaneCard        = ( initObj.BaneCard        || [] );
    this.EventCards      = ( initObj.EventCards      || [] );
    this.LandmarkCards   = ( initObj.LandmarkCards   || [] );
    this.Obelisk         = ( initObj.Obelisk         || [] );
    this.BlackMarketPile = ( initObj.BlackMarketPile || [] );
  }


  concatAllCards(): number[] {
    return [].concat(
      this.KingdomCards10,
      this.BaneCard,
      this.EventCards,
      this.LandmarkCards,
      this.Obelisk,
      this.BlackMarketPile,
    );
  }

}
