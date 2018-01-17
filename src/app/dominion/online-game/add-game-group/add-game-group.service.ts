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
  private myName: string = '';

  constructor(
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService,
    private utils: UtilitiesService,
  ) {
    this.database.cardPropertyList$
      .subscribe( val => this.cardPropertyList = val );

    this.myUserInfo.name$
      .subscribe( val => this.myName = val );
  }

  async init(
    numberOfPlayers: number,
    isSelectedExpansions: boolean[],
    memo: string,
    selectCards: SelectedCards
  ) {
    const newRoom = new GameRoom();
    {
      newRoom.numberOfPlayers = numberOfPlayers;
      newRoom.isSelectedExpansions = isSelectedExpansions;
      newRoom.memo = memo;
      newRoom.playerShuffler = this.utils.permutation( numberOfPlayers );
      newRoom.selectedCards = selectCards;
      newRoom.initCards( this.cardPropertyList );
      newRoom.initDecks();
    }

    // make new GameState object
    const newGameState = new GameState();

    {
      const result = await this.database.onlineGameState.add( newGameState );
      newRoom.gameStateID = result.key;
    }

    // make new GameRoom object
    {
      const result = await this.database.onlineGameRoom.add( newRoom );
      const newRoomID = result.key;
      newRoom.databaseKey = newRoomID;
    }

    // add me to GameRoom object
    await this.database.onlineGameRoom.addMember( newRoom.databaseKey, this.myName );

    return newRoom;
  }

}
