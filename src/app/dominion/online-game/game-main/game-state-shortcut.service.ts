import { Injectable } from '@angular/core';

import {
    GameState,
    DCard,
    BasicCards,
    KingdomCards,
    PlayerData,
    PlayerCards,
    TurnInfo,
  } from '../../../classes/game-state';
import { GameStateService } from './game-state.service';


@Injectable()
export class GameStateShortcutService {

  constructor(
    private gameStateService: GameStateService
  ) { }


  // View 操作から
  onCardClicked( card: DCard ) {
    console.log( card );
  }

  goToNextPhase() {
  }

  goToNextPlayer() {
    // this.gameLoopService.clickedCardIdSource.next( this.gameLoopService.GO_TO_NEXT_PLAYER_ID );
    // this.gameLoopService.goToNextPlayerState = true;
  }

  sortMyHandCards() {
  }


  // shortcut












  // test
  test_faceUpAllCards() {
  }
  test_faceDownAllCards() {
  }
  test_isButtonAllCards() {
  }
  test_isNotButtonAllCards() {
  }

}
