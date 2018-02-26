import { Injectable } from '@angular/core';

import { DCard, GameState, PlayerCards, Phase } from '../../../../../classes/game-state';
import { CardProperty } from '../../../../../classes/card-property';
import { UserInput    } from '../../../../../classes/game-room-communication';

import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameStateService } from './game-state.service';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameStateShortcutService } from './game-state-shortcut.service';
import { GameMessageService } from '../game-message.service';


@Injectable()
export class GameLoopService {


  constructor(
    private utils: UtilitiesService,
    private gameRoomService: MyGameRoomService,
    private gameState: GameStateService,
    private shortcut: GameStateShortcutService,
    private messageService: GameMessageService,
  ) {
  }



  async phaseAction(
    gameState: GameState,
    userInput: UserInput,
    Prosperity: boolean,
    playersName: string,
  ) {
    const shuffleBy = userInput.data.shuffleBy;
    const printPhase = (phase: Phase) => 0;
      // console.log(`it's ${gameState.turnPlayerIndex()}'s ${phase} phase` );

    while ( true ) {  // 自動フェーズ変更のため
      const turnInfo        = gameState.turnInfo;
      const turnPlayerCards = gameState.turnPlayerCards();
      const turnPlayerId    = gameState.turnPlayerIndex();

      this.shortcut.resetDCardsAttributes( gameState );

      const phaseBefore = turnInfo.phase;

      switch ( turnInfo.phase ) {
        case '': {
          printPhase('');
          turnInfo.action = 1;
          turnInfo.buy    = 1;
          turnInfo.coin   = 0;
          turnInfo.phase  = 'StartOfTurn';
          break;
        }

        case 'StartOfTurn': {
          printPhase('StartOfTurn');
          turnInfo.phase = 'Action';
          break;
        }

        case 'Action': {
          printPhase('Action');
          const actionCards = turnPlayerCards.HandCards.filter( c =>
              c.cardProperty.cardTypes.includes('Action') );
          if ( turnInfo.action <= 0 || actionCards.length <= 0 ) {
            // 法貨を実装したらここの条件を変える必要あり
            turnInfo.phase = 'BuyPlay';
          } else {
            this.shortcut.buttonizeForTurnPlayer( actionCards, gameState );
          }
          break;
        }

        case 'BuyPlay': {
          printPhase('BuyPlay');
          const treasureCards = turnPlayerCards.HandCards.filter( c =>
              c.cardProperty.cardTypes.includes('Treasure') );

          if ( treasureCards.length <= 0 ) {
            turnInfo.phase = 'BuyCard';
          } else {
            this.shortcut.buttonizeForTurnPlayer( treasureCards, gameState );
          }
          /* Pouchなどでbuyが増やせるのでBuyPlayフェーズではbuy <= 0 で自動遷移はできない */
          if ( turnInfo.buy > 0 ) {
            this.shortcut.buttonizeSupplyIf( gameState, turnPlayerId,
                (c: DCard) => c.cardProperty.cost.coin <= turnInfo.coin );
          }
          break;
        }

        case 'BuyCard': {
          printPhase('BuyCard');
          if ( turnInfo.buy <= 0 ) {
            turnInfo.phase = 'Night';
          } else {
            this.shortcut.buttonizeSupplyIf( gameState, turnPlayerId,
                (c: DCard) =>
                  c.cardProperty.cost.coin <= turnInfo.coin );
          }
          break;
        }

        case 'Night': {
          printPhase('Night');
          // 未実装
          turnInfo.phase = 'CleanUp';
          break;
        }

        case 'CleanUp': {
          printPhase('CleanUp');
          await this.shortcut.cleanUp(
                  gameState,
                  turnPlayerId,
                  playersName,
                  shuffleBy );
          turnInfo.phase = 'EndOfTurn';
          break;
        }

        case 'EndOfTurn': {
          printPhase('EndOfTurn');
          if ( gameState.gameIsOverConditions( Prosperity ) ) {
            turnInfo.phase = 'GameIsOver';
          } else {
            gameState.turnCounter++;
            turnInfo.phase = '';
          }
          this.messageService.pushMessage(`---${playersName}のターン終了---`);
          break;
        }

        case 'GameIsOver': {
          printPhase('GameIsOver');
          this.gameState.setGameState( gameState );
          break;
        }

        default:
          break;
      }
      if ( phaseBefore === turnInfo.phase ) break;
    }
  }

}
