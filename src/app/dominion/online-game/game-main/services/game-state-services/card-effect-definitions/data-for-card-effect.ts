import { DCard } from '../../../../../../classes/online-game/dcard';
import { GameState } from '../../../../../../classes/online-game/game-state';


export interface DataForCardEffect {
  shuffleBy:       number[];
  gameState:       GameState;
  gameStateSetter: (gst: GameState) => void;
  playersNameList: string[];
  messager:        ((msg: string) => void);
}
