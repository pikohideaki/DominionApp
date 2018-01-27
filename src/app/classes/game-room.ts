import { shuffle, objectEntries, seq0 } from '../my-own-library/utilities';

import { SelectedCards } from './selected-cards';
import { CardProperty, numberToPrepare, toListIndex } from './card-property';
import { GameState, DCard, PlayerCards } from './game-state';


export class GameRoom {
  // set mannually
  numberOfPlayers:      number = 2;
  memo:                 string = '';
  isSelectedExpansions: boolean[] = [];

  // set automatically
  databaseKey:             string        = '';
  gameRoomCommunicationId: string        = '';
  date:                    Date          = new Date();
  playerShuffler:          number[]      = [];
  playersName:             string[]      = [];
  selectedCards:           SelectedCards = new SelectedCards();
  initialState:            GameState     = new GameState();


  constructor( databaseKey?: string, dataObj?: {
      numberOfPlayers:         number,
      memo:                    string,
      isSelectedExpansions:    boolean[],
      gameRoomCommunicationId: string,
      timeStamp:               number,
      playerShuffler:          number[],
      playersName:             Object,
      selectedCards:           any,
      initialState:            GameState,
    }
  ) {
    this.databaseKey = ( databaseKey || '' );

    if ( !dataObj ) return;
    this.numberOfPlayers      = ( dataObj.numberOfPlayers || 0 );
    this.memo                 = ( dataObj.memo || '' );
    this.isSelectedExpansions = ( dataObj.isSelectedExpansions || [] );

    this.gameRoomCommunicationId = ( dataObj.gameRoomCommunicationId || '' );
    this.date                   = new Date( dataObj.timeStamp || Date.now() );
    this.playerShuffler         = ( dataObj.playerShuffler || seq0( this.numberOfPlayers ) );
    this.playersName            = objectEntries( dataObj.playersName );
    this.selectedCards          = new SelectedCards( dataObj.selectedCards );
    this.initialState           = ( dataObj.initialState || new GameState() );
  }

  initCards( cardPropertyList: CardProperty[] ) {
    let serialNumber = 0;

    const addCard = ( cardListIndex: number, placePath: (string|number)[] ) => {
      const card = new DCard();
      card.id = serialNumber++;
      card.cardListIndex = cardListIndex;
      card.faceUp   = seq0( this.numberOfPlayers ).map( _ => false  );
      card.isButton = seq0( this.numberOfPlayers ).map( _ => false );

      let ref: any = this.initialState.DCards;
      for ( let i = 0; i < placePath.length; ++i ) {
        ref = ref[placePath[i]];
      }
      ref.push( card );
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

    const toCardPropIndex = ( cardId: string ) => toListIndex( cardPropertyList, cardId );

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
    for ( let index = 0; index < this.numberOfPlayers; ++index ) {
      const playerCards = new PlayerCards();
      /* get 7 Coppers from supply */
      for ( let i = 0; i < 7; ++i ) {
        playerCards.Deck.push( this.initialState.DCards.BasicCards.Copper.pop() );
      }
      /* get 3 Estates from supply */
      for ( let i = 0; i < 3; ++i ) {
        playerCards.Deck.push( this.initialState.DCards.BasicCards.Estate.pop() );
      }

      shuffle( playerCards.Deck );

      for ( let i = 0; i < 5; ++i ) {
        playerCards.HandCards.push( playerCards.Deck.pop() );
      }

      // this.sortHandCards( index, cardpropertyList );

      this.initialState.DCards.allPlayersCards.push( playerCards );
    }
  }

  waitingForNewPlayers(): boolean {
    return ( this.playersName.length < this.numberOfPlayers );
  }
}
