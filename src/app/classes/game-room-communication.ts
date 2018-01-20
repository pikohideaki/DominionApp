import { ChatMessage } from './chat-message';

export class GameCommunication {
  databaseKey: string;
  chatList:    ChatMessage[] = [];
  moves:       MoveInGame[]  = [];

  constructor( databaseKey?: string, dataObj?: {
      chatList: ChatMessage[],
      moves:    MoveInGame[],
    }
  ) {
    this.databaseKey = ( databaseKey || '' );

    if ( !dataObj ) return;
    this.chatList = ( dataObj.chatList || [] );
    this.moves    = ( dataObj.moves    || [] );
  }
}


export class MoveInGame {
  instructionName: string;
  data:            Object;
}


export type Instruction =  'increment turnCounter'
                          |'set phase'
                          |'set action'
                          |'set buy'
                          |'set coin'
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
