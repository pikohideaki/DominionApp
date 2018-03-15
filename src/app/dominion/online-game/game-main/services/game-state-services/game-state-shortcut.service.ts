import { Injectable } from '@angular/core';

import { GameStateService } from './game-state.service';
import { GameMessageService } from '../game-message.service';
import { GameState } from '../../../../../classes/online-game/game-state';
import { UserInput } from '../../../../../classes/online-game/user-input';
import { buyCard, playCard } from './shortcut';


@Injectable()
export class GameStateShortcutService {

  constructor(
    private gameStateService: GameStateService,
    private messageService: GameMessageService,
  ) {
  }



  async playAllTreasures(
    gameState: GameState,
    playerId: number,
    playersNameList: string[],
    shuffleBy: number[],
    showMessage: boolean = true
  ) {
    const basicTreasures
      = gameState.DCards.allPlayersCards[ playerId ].HandCards
          .filter( d => d.cardProperty.isBasicTreasure() );

    if ( showMessage ) {
      const name = basicTreasures.map( e => e.cardProperty.nameJp ).join('、');
      this.messageService.pushMessage(
          `${playersNameList[ playerId ]}が（${name}）をプレイしました。`);
    }
    for ( const dcard of basicTreasures ) {
      await playCard( dcard, playerId, {
          shuffleBy       : shuffleBy,
          gameState       : gameState,
          gameStateSetter : (gst: GameState) => this.gameStateService.setGameState( gameState ),
          playersNameList : playersNameList,
          messager        : null,
        }, false );
    }
  }

  onVcoinClick( gameState: GameState, userInput: UserInput ) {
    gameState.turnInfo.coin++;
    gameState.allPlayersData[ userInput.data.playerId ].vcoin--;
    this.gameStateService.setGameState( gameState );
  }

  onDebtClick( gameState: GameState, userInput: UserInput ) {
    // todo
  }


  async onCardClick(
    gameState: GameState,
    userInput: UserInput,
    playersNameList: string[],
  ) {
    const playerId    = userInput.data.playerId;
    const shuffleBy   = userInput.data.shuffleBy;
    const clickedCard = gameState.getDCard( userInput.data.clickedCardId );
    const dir         = gameState.getDirectory( userInput.data.clickedCardId );

    switch ( gameState.turnInfo.phase ) {
      case 'Action': // アクションカードの通常の使用
        await playCard( clickedCard, playerId, {
            shuffleBy       : userInput.data.shuffleBy,
            gameState       : gameState,
            gameStateSetter : (gst: GameState) => this.gameStateService.setGameState( gameState ),
            playersNameList : playersNameList,
            messager        : (msg: string) => this.messageService.pushMessage(msg),
          }, false );
        gameState.turnInfo.action -= 1;
        break;

      case 'Action*':
        // アクションカードの通常以外の使用，選択したカードの獲得
        break;

      case 'BuyPlay':
        if ( dir[0] === 'allPlayersCards' && dir[1] === playerId && dir[2] === 'HandCards' ) {
          // 財宝カードの通常の使用
          await playCard( clickedCard, playerId, {
              shuffleBy       : userInput.data.shuffleBy,
              gameState       : gameState,
              gameStateSetter : (gst: GameState) => this.gameStateService.setGameState( gameState ),
              playersNameList : playersNameList,
              messager        : (msg: string) => this.messageService.pushMessage(msg),
            }, false );
        }
        if ( dir[0] === 'BasicCards' || dir[0] === 'KingdomCards' ) {
          // カードの購入
          gameState.turnInfo.phase = 'BuyCard';
          buyCard( clickedCard, playerId, {
              shuffleBy       : userInput.data.shuffleBy,
              gameState       : gameState,
              gameStateSetter : (gst: GameState) => this.gameStateService.setGameState( gameState ),
              playersNameList : playersNameList,
              messager        : (msg: string) => this.messageService.pushMessage(msg),
            }, true );
        }
        break;

      case 'BuyPlay*': // 財宝カードの通常以外の使用
        break;

      case 'BuyCard': // サプライなどからのカードの購入
        buyCard( clickedCard, playerId, {
            shuffleBy       : userInput.data.shuffleBy,
            gameState       : gameState,
            gameStateSetter : (gst: GameState) => this.gameStateService.setGameState( gameState ),
            playersNameList : playersNameList,
            messager        : (msg: string) => this.messageService.pushMessage(msg),
          }, true );
        break;

      case 'Night': // Nightカードの使用
        await playCard( clickedCard, playerId, {
            shuffleBy       : userInput.data.shuffleBy,
            gameState       : gameState,
            gameStateSetter : (gst: GameState) => this.gameStateService.setGameState( gameState ),
            playersNameList : playersNameList,
            messager        : (msg: string) => this.messageService.pushMessage(msg),
          }, false );
        break;

      default:
        break;
    }

  }


}
