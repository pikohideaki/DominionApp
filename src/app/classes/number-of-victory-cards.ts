export class NumberOfVictoryCards {
  VPtoken:          number = 0;
  others:           number = 0;
  othersMinus:      number = 0;

  Curse:            number = 0;  // -1
  Estate:           number = 0;  //  1
  Duchy:            number = 0;  //  3
  Province:         number = 0;  //  6
  Colony:           number = 0;  // 10
  Great_Hall:       number = 0;  //  1
  Nobles:           number = 0;  //  2
  Harem:            number = 0;  //  2
  Farmland:         number = 0;  //  2
  Island:           number = 0;  //  2
  Tunnel:           number = 0;  //  2
  Dame_Josephine:   number = 0;  //  2
  Overgrown_Estate: number = 0;  //  0
  Mill:             number = 0;  //  1
  Cemetery:         number = 0;  //  2

  Gardens:          number = 0;
  Duke:             number = 0;  // 公爵
  Vineyard:         number = 0;
  Fairgrounds:      number = 0;  // 品評会
  Silk_Road:        number = 0;
  Feodum:           number = 0;  // 封土
  Distant_Lands:    number = 0;
  Pasture:          number = 0;

  Humble_Castle:    number = 0;
  Crumbling_Castle: number = 0;
  Small_Castle:     number = 0;
  Haunted_Castle:   number = 0;
  Opulent_Castle:   number = 0;
  Sprawling_Castle: number = 0;
  Grand_Castle:     number = 0;
  Kings_Castle:     number = 0;

  DeckSize:                      number = 0;  // for Gardens
  numberOfActionCards:           number = 0;  // for Vineyard
  numberOfDifferentlyNamedCards: number = 0;  // for Fairgrounds
  numberOfSilvers:               number = 0;  // for Feodum
  Distant_Lands_on_TavernMat:    number = 0;  // for Distant_Lands

  constructor( initObj? ) {
    if ( !initObj ) return;
    Object.keys( initObj ).forEach( key =>
      this[key] = ( initObj[key] || 0 ) );
  }


  countVictoryCards(): number {
    return 0
      + this.Estate
      + this.Duchy
      + this.Province
      + this.Colony
      + this.Great_Hall
      + this.Nobles
      + this.Harem
      + this.Farmland
      + this.Island
      + this.Tunnel
      + this.Dame_Josephine
      + this.Overgrown_Estate
      + this.Mill
      + this.Cemetery
      + this.Gardens
      + this.Duke
      + this.Vineyard
      + this.Fairgrounds
      + this.Silk_Road
      + this.Feodum
      + this.Distant_Lands
      + this.Pasture
      + this.countCastles();
  }


  countCastles(): number {
    return 0
      + this.Humble_Castle
      + this.Crumbling_Castle
      + this.Small_Castle
      + this.Haunted_Castle
      + this.Opulent_Castle
      + this.Sprawling_Castle
      + this.Grand_Castle
      + this.Kings_Castle
      ;
  }
}
