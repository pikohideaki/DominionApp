import { ChatMessage } from './chat-message';

export class GameRoomCommunication {
  chatList:        ChatMessage[]     = [];
  stateTransition: StateTransition[] = [];
}

export class StateTransition {
  player:        number;
  operationName: string;
  data:          Object;
}
