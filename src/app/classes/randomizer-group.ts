import { SelectedCards } from './selected-cards';
import { SelectedCardsCheckbox } from './selected-cards-checkbox-values';
import { PlayerResult } from './player-result';
import { BlackMarketPileCard } from './black-market-pile-card';
import { BlackMarketPhase    } from '../classes/black-market-phase.enum';


export class RandomizerGroup {
  databaseKey:               string;       // set only when newly created
  name:                      string = '';  // set only when newly created
  password:                  string = '';  // set only when newly created
  date:                      Date = new Date();   // set only when newly created
  randomizerButtonLocked:    boolean = false;
  isSelectedExpansions:      boolean[] = [];
  selectedCards:             SelectedCards = new SelectedCards();
  selectedCardsCheckbox:     SelectedCardsCheckbox = new SelectedCardsCheckbox();
  BlackMarketPileShuffled:   BlackMarketPileCard[] = [];
  BlackMarketPhase:          number = BlackMarketPhase.init;
  newGameResultDialogOpened: boolean = false;
  newGameResult: {
    players: PlayerResult[],
    place:   string,
    memo:    string,
  } = {
    players: [],
    place:   '',
    memo:    '',
  };
  lastTurnPlayerName: string = '';

  resetVPCalculator: number = 0;
  selectedCardsHistory: { selectedCards: SelectedCards, date: Date }[] = [];


  constructor( databaseKey?: string, initObj?: {
    name:                      string,
    password:                  string,
    timeStamp:                 number,
    randomizerButtonLocked:    boolean,
    isSelectedExpansions:      boolean[],
    selectedCards:             SelectedCards,
    selectedCardsCheckbox:     SelectedCardsCheckbox,
    BlackMarketPileShuffled:   BlackMarketPileCard[],
    BlackMarketPhase:          number,
    newGameResultDialogOpened: boolean,
    newGameResult: {
      players: Object,
      place:   string,
      memo:    string,
    },
    lastTurnPlayerName: string,
    resetVPCalculator: number,
    selectedCardsHistory: Object,
  }) {
    this.databaseKey = ( databaseKey || '' );

    if ( !initObj ) return;
    this.name                      = ( initObj.name || '' );
    this.password                  = ( initObj.password || '' );
    this.date                      = new Date( initObj.timeStamp || Date.now() );
    this.randomizerButtonLocked    = !!initObj.randomizerButtonLocked;
    this.isSelectedExpansions      = ( initObj.isSelectedExpansions || [] );
    this.selectedCards             = new SelectedCards( initObj.selectedCards );
    this.selectedCardsCheckbox     = new SelectedCardsCheckbox( initObj.selectedCardsCheckbox );
    this.BlackMarketPileShuffled   = ( initObj.BlackMarketPileShuffled || [] );
    this.BlackMarketPhase          = ( initObj.BlackMarketPhase || BlackMarketPhase.init );
    this.newGameResultDialogOpened = !!initObj.newGameResultDialogOpened;

    this.lastTurnPlayerName        = ( initObj.lastTurnPlayerName || '' );
    this.selectedCardsHistory      = ( entries( initObj.selectedCardsHistory )
                                          .map( e => ({
                                            selectedCards: e.value.selectedCards,
                                            date : new Date( e.value.timeStamp )
                                          }) ) || [] );

    if ( !!initObj.newGameResult ) {
      this.newGameResult.players     = ( entries( initObj.newGameResult.players )
                                            .map( e => new PlayerResult( e.key, e.value ) ) || [] )
                                          .sort( (a, b) => compareString(a.name, b.name) );
      this.newGameResult.place       = ( initObj.newGameResult.place || '' );
      this.newGameResult.memo        = ( initObj.newGameResult.memo || '' );
      this.resetVPCalculator         = ( initObj.resetVPCalculator || 0 );
    }
  }
}


function entries( obj: any ): { key: string, value: any }[] {
  if ( !obj ) return [];
  return Object.keys(obj).map( key => ({ key: key, value: obj[key] }) );
}

function compareString( a: string, b: string ): number {
  if ( a < b ) return -1;
  if ( a > b ) return 1;
  return 0;
}
