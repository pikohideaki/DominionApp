import { Injectable } from '@angular/core';

import { CardProperty } from '../../../../../classes/card-property';

import { GameStateService } from './game-state.service';
import { GameStateShortcutService } from './game-state-shortcut.service';
import { GameMessageService } from '../game-message.service';
import { UserInput } from '../../../../../classes/online-game/user-input';
import { Phase } from '../../../../../classes/online-game/phase';
import { DCard } from '../../../../../classes/online-game/dcard';
import { GameState } from '../../../../../classes/online-game/game-state';
import { buttonizeForTurnPlayer, buttonizeSupplyIf, resetDCardsAttributes, cleanUp } from './shortcut';
import { ValuesForViewService } from '../values-for-view.service';


@Injectable()
export class GameLoopService {


  constructor(
    private gameState: GameStateService,
    private shortcut: GameStateShortcutService,
    private messageService: GameMessageService,
    private valuesForView: ValuesForViewService,
  ) {
  }



  async phaseAction(
    gameState: GameState,
    userInput: UserInput,
    playersNameList: string[],
  ) {
    const shuffleBy = userInput.data.shuffleBy;
    const printPhase = (phase: Phase) => 0;
      // console.log(`it's ${gameState.turnPlayerIndex()}'s ${phase} phase` );

    while ( true ) {  // 自動フェーズ変更のため
      const turnInfo        = gameState.turnInfo;
      const turnPlayerCards = gameState.turnPlayerCards();
      const turnPlayerData  = gameState.turnPlayerData();
      const turnPlayerId    = gameState.turnPlayerIndex();

      resetDCardsAttributes( gameState,
          (b: boolean) => this.valuesForView.setGainCardState( true ) );

      const phaseBefore = turnInfo.phase;

      switch ( turnInfo.phase ) {
        case '': {
          printPhase('');
          turnInfo.action = 1;
          turnInfo.buy    = 1;
          turnInfo.coin   = 0;
          turnInfo.potion = 0;
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
            buttonizeForTurnPlayer( actionCards, gameState );
          }
          break;
        }

        case 'BuyPlay': {
          printPhase('BuyPlay');
          const treasureCards = turnPlayerCards.HandCards.filter( c =>
              c.cardProperty.cardTypes.includes('Treasure') );

          if ( treasureCards.length + turnPlayerData.vcoin <= 0 ) {
            turnInfo.phase = 'BuyCard';
          } else {
            buttonizeForTurnPlayer( treasureCards, gameState );
          }
          /* Pouchなどでbuyが増やせるのでBuyPlayフェーズではbuy <= 0 で自動遷移はできない */
          if ( turnInfo.buy > 0 ) {
            buttonizeSupplyIf( gameState, turnPlayerId,
                (c: DCard) => c.cardProperty.cost.coin   <= turnInfo.coin
                           && c.cardProperty.cost.potion <= turnInfo.potion,
                (b: boolean) => this.valuesForView.setGainCardState( true ) );
          }
          break;
        }

        case 'BuyCard': {
          printPhase('BuyCard');
          if ( turnInfo.buy <= 0 ) {
            turnInfo.phase = 'Night';
          } else {
            buttonizeSupplyIf( gameState, turnPlayerId,
                (c: DCard) => c.cardProperty.cost.coin   <= turnInfo.coin
                           && c.cardProperty.cost.potion <= turnInfo.potion,
                (b: boolean) => this.valuesForView.setGainCardState( true ) );
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
          await cleanUp( turnPlayerId, {
              shuffleBy       : userInput.data.shuffleBy,
              gameState       : gameState,
              gameStateSetter : (gst: GameState) => this.gameState.setGameState( gameState ),
              playersNameList : playersNameList,
              messager        : (msg: string) => this.messageService.pushMessage(msg),
            });
          turnInfo.phase = 'EndOfTurn';
          break;
        }

        case 'EndOfTurn': {
          printPhase('EndOfTurn');
          if ( gameState.gameIsOverConditions() ) {
            turnInfo.phase = 'GameIsOver';
          } else {
            gameState.incrementTurnCounter();
            turnInfo.phase = '';
          }
          this.messageService.pushMessage(`---${playersNameList[ turnPlayerId ]}のターン終了---`);
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
