import { ChatMessage } from './chat-message';
import { DCardPath } from './game-state';

export class GameCommunication {
  databaseKey: string;
  chatList:    ChatMessage[] = [];
  moves:       StateTransition[]  = [];

  constructor( databaseKey?: string, dataObj?: {
      chatList: ChatMessage[],
      moves:    StateTransition[],
    }
  ) {
    this.databaseKey = ( databaseKey || '' );

    if ( !dataObj ) return;
    this.chatList = ( dataObj.chatList || [] );
    this.moves    = ( dataObj.moves    || [] );
  }
}


export class StateTransition {
  instruction: Instruction;
  data: {
    value?: any,
    cardIdArray?: number[],
    playerIdArray?: number[],
    dest?: DCardPath[],
    playerId?: number,
  };
  constructor( initObj?: StateTransition ) {
    if ( !initObj ) return;
    this.instruction = initObj.instruction;
    this.data = initObj.data;
  }
}


export type Instruction =  'increment turnCounter'
                          |'set phase'
                          |'set action'
                          |'set buy'
                          |'set coin'
                          |'add action'
                          |'add buy'
                          |'add coin'
                          |'set VPtoken of player'
                          |'face up cards for players'
                          |'face down cards for players'
                          |'buttonize cards for players'
                          |'unbuttonize cards for players'
                          |'move cards to'
                          |'face up cards for all players'
                          |'face down cards for all players'
                          |'buttonize cards for all players'
                          |'unbuttonize cards for all players'
                          |'trash'
                          |'discard'
                          |'play'
                          |'gain'
                          |'gain to'
                          |'set aside';


export type UserInput = ''
                       |'clicked card'
                       |'clicked nextPhase'
                       |'clicked turnEnd'
                       |'clicked sortMyHandcards'
                       ;

class GameRecord {
  userInput: UserInput;
  data: {
    clickedCardId?: number,
    shuffledCardsId?: number[],
  };
}
