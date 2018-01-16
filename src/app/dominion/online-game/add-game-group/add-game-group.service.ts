import { Injectable } from '@angular/core';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty, numberToPrepare, toListIndex } from '../../../classes/card-property';
import { SelectedCards } from '../../../classes/selected-cards';
import { GameRoom, PlayerData, PlayersCards, CardDataForPlayer } from '../../../classes/game-room';
import { GameState } from '../../../classes/game-state';
import { BlackMarketPileCard } from '../../../classes/black-market-pile-card';



@Injectable()
export class AddGameGroupService {

  private cardPropertyList: CardProperty[] = [];


  constructor(
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService,
    private utils: UtilitiesService,
  ) {
    this.database.cardPropertyList$
      .subscribe( val => this.cardPropertyList = val );
  }

  init(
    numberOfPlayers: number,
    isSelectedExpansions: boolean[],
    memo: string
  ) {
    const myName: string = '';  // 自分の名前
    const selectedCards: SelectedCards = new SelectedCards();
    const BlackMarketPileShuffled: BlackMarketPileCard[] = [];


    const newRoom = new GameRoom();
    {
      newRoom.numberOfPlayers         = numberOfPlayers;
      newRoom.selectedCards           = selectedCards;
      // newRoom.BlackMarketPileShuffled = BlackMarketPileShuffled;
      newRoom.isSelectedExpansions    = isSelectedExpansions;
    }

    // make new GameState object
    const newGameState = new GameState();
    {
      // this.setNumberOfPlayers( newGameState, newRoom.numberOfPlayers );
      // this.initCards( newGameState, newRoom.numberOfPlayers, newRoom.selectedCards );
      // this.initDecks( newGameState );
    }
    newRoom.gameStateID = this.database.onlineGameState.add( newGameState ).key;

    // make new GameRoom object
    const newRoomID = this.database.onlineGameRoom.add( newRoom ).key;
    newRoom.databaseKey = newRoomID;

    // add me to GameRoom object
    this.database.onlineGameRoom.addMember( newRoomID, myName );

    return newRoom;
  }


  setNumberOfPlayers( newGameState: GameState, numberOfPlayers: number ) {
    // newGameState.playersData = Array.from( new Array(numberOfPlayers), () => new PlayerData() );
    // newGameState.cards.playersCards = Array.from( new Array(numberOfPlayers), () => new PlayersCards() );
    // newGameState.cardDataForPlayer  = Array.from( new Array(numberOfPlayers), () => new CardDataForPlayer() );
    // newGameState.permute = this.utils.permutation( numberOfPlayers );
  }
}
