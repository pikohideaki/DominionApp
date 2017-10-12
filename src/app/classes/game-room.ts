import { SelectedCards } from './selected-cards';
import { BlackMarketPileCard } from './black-market-pile-card';

export class GameRoom {
  databaseKey:             string;
  date:                    Date = new Date( Date.now() );
  name:                    string = '';
  memo:                    string = '';
  waitingForPlayers:       boolean = true;
  players:                 string[] = [];
  numberOfPlayers:         number = 2;
  isSelectedExpansions:    boolean[] = [];
  selectedCards:           SelectedCards = new SelectedCards();
  BlackMarketPileShuffled: BlackMarketPileCard[] = [];
  gameStateID:             string;


  constructor( databaseKey?: string, dataObj?: {
      timeStamp:               number,
      name:                    string,
      memo:                    string,
      waitingForPlayers:       boolean,
      players:                 string[],
      numberOfPlayers:         number,
      isSelectedExpansions:    boolean[],
      selectedCards:           SelectedCards,
      BlackMarketPileShuffled: BlackMarketPileCard[],
      gameStateID:             string,
    }
  ) {
    this.databaseKey = ( databaseKey || '' );

    if ( !dataObj ) return;
    this.date                    = new Date( dataObj.timeStamp || Date.now() );
    this.name                    = ( dataObj.name || '' );
    this.memo                    = ( dataObj.memo || '' );
    this.waitingForPlayers       = !!dataObj.waitingForPlayers;
    this.players                 = Object.keys( dataObj.players || {} ).map( key => dataObj.players[key] );
    this.numberOfPlayers         = ( dataObj.numberOfPlayers || 0 );
    this.isSelectedExpansions    = ( dataObj.isSelectedExpansions || [] );
    this.selectedCards           = new SelectedCards( dataObj.selectedCards );
    this.BlackMarketPileShuffled = ( dataObj.BlackMarketPileShuffled || [] );
    this.gameStateID             = ( dataObj.gameStateID || '' );
  }
}
