import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GameResult           } from '../../../../classes/game-result';
import { GameState            } from '../../../../classes/game-state';
import { NumberOfVictoryCards } from '../../../../classes/number-of-victory-cards';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';
import { VictoryPointsCalculatorService } from '../../../sub-components/victory-points-calculator/victory-points-calculator.service';
import { GameStateService } from './game-state-services/game-state.service';
import { MyGameRoomService } from './my-game-room.service';


@Injectable()
export class SubmitGameResultService {

  gameResult$: Observable<GameResult>
    = Observable.combineLatest(
      this.database.scoringTable$,
      this.gameStateService.gameState$,
      this.myGameRoomService.myGameRoom$,
      this.database.expansionNameList$,
      this.database.cardPropertyList$,
      (defaultScores, gameState, gameRoom, expansionNameList, cardPropertyList) => {
        const selectedExpansionNameList
          = expansionNameList.filter( (name, i) => gameRoom.isSelectedExpansions[i] );
        const selectedCards = gameRoom.selectedCards;
        const indexToId = cardIndex => cardPropertyList[cardIndex].cardId;
        const playersName = gameRoom.playersNameShuffled();
        const lastTurnPlayerName = playersName[ gameState.turnPlayerIndex() ];

        const gameResult = new GameResult( null, {
          timeStamp  : Date.now(),
          place      : 'Online',
          memo       : '',
          selectedExpansionNameList : selectedExpansionNameList,
          selectedCardsId : {
            Prosperity      : selectedCards.Prosperity,
            DarkAges        : selectedCards.DarkAges,
            KingdomCards10  : selectedCards.KingdomCards10 .map( indexToId ),
            BaneCard        : selectedCards.BaneCard       .map( indexToId ),
            EventCards      : selectedCards.EventCards     .map( indexToId ),
            Obelisk         : selectedCards.Obelisk        .map( indexToId ),
            LandmarkCards   : selectedCards.LandmarkCards  .map( indexToId ),
            BlackMarketPile : selectedCards.BlackMarketPile.map( indexToId ),
          },
          players : playersName.map( (name, i) => ({
                    name      : name,
                    VP        : this.vpTotal( i, gameState ),
                    turnOrder : i,
                    rank      : 1,
                    score     : 0,
                  }) ),
          lastTurnPlayerName: lastTurnPlayerName,
        });

        gameResult.rankPlayers();
        gameResult.setScores( defaultScores );
        return gameResult;
      });


  constructor(
    private database: CloudFirestoreMediatorService,
    private vpcalc: VictoryPointsCalculatorService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
  ) { }



  submitGameResult( gameResult: GameResult ) {
    return this.database.gameResult.add( gameResult );
  }

  private vpTotal( playerIndex: number, gameState: GameState ) {
    return this.vpcalc.total( this.countNumberOfVictoryCards( playerIndex, gameState ) );
  }

  private countNumberOfVictoryCards( playerIndex: number, gameState: GameState ): NumberOfVictoryCards {
    const numberOfVictoryCards = new NumberOfVictoryCards();
    const playerCards = gameState.DCards.allPlayersCards[ playerIndex ];
    playerCards.getDCards()
      .filter( dcard => dcard.cardProperty.cardTypes.includes('Victory') )
      .forEach( dcard => {
        numberOfVictoryCards[ dcard.cardProperty.cardId ]++;
      });
    // 特殊勝利点を追加したらここに計算を追加
    return numberOfVictoryCards;
  }
}
