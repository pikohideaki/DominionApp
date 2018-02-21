import { ChatMessage } from './chat-message';
import { DCardPath } from './game-state';
import { permutation } from '../my-own-library/utilities';

export class GameCommunication {
  databaseKey: string = '';

  chatList:          ChatMessage[] = [];
  userInputList:     UserInput[]   = [];
  resetGameClicked:  number        = 0;
  thinkingState:     boolean[]     = [];
  isTerminated:      boolean       = false;
  resultIsSubmitted: boolean       = false;


  constructor( databaseKey?: string, dataObj?: {
      chatList:          ChatMessage[],
      userInputList:     UserInput[],
      resetGameClicked:  number,
      thinkingState:     boolean[],
      isTerminated:      boolean,
      resultIsSubmitted: boolean,
    }
  ) {
    this.databaseKey = ( databaseKey || '' );

    if ( !dataObj ) return;
    this.chatList          = ( dataObj.chatList         || [] );
    this.userInputList     = ( dataObj.userInputList    || [] );
    this.resetGameClicked  = ( dataObj.resetGameClicked || 0  );
    this.thinkingState     = ( dataObj.thinkingState    || [] );
    this.isTerminated      = !!dataObj.isTerminated;
    this.resultIsSubmitted = !!dataObj.resultIsSubmitted;
  }
}



export type UserInputCommand = ''
                       |'clicked card'
                       |'clicked goToNextPhase'
                       |'clicked finishMyTurn'
                       |'clicked sortHandcards'
                       |'play all treasures'
                       |'increment turnCounter'  // test
                      ;

export class UserInput {
  command: UserInputCommand = '';
  data: {
    playerId: number,
    clickedCardId?: number,
    shuffleBy: number[]
  };

  constructor(
    command: UserInputCommand,
    playerId: number,
    clickedCardId?: number
  ) {
    this.command = (command || '');
    this.data = { playerId: playerId, shuffleBy: permutation( 200 ) };
    if ( clickedCardId !== undefined ) {
      this.data.clickedCardId = clickedCardId;
    }
  }
}
