import { Injectable } from '@angular/core';

import { utils } from '../../../my-own-library/utilities';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty, numberToPrepare, toListIndex } from '../../../classes/card-property';
import { SelectedCards       } from '../../../classes/selected-cards';
import { GameRoom            } from '../../../classes/online-game/game-room';
import { GameCommunication   } from '../../../classes/online-game/game-room-communication';
import { BlackMarketPileCard } from '../../../classes/black-market-pile-card';
import { ChatMessage         } from '../../../classes/online-game/chat-message';
import { UserInput           } from '../../../classes/online-game/user-input';
import { TurnInfo            } from '../../../classes/online-game/turn-info';



@Injectable()
export class AddGameGroupService {

  private cardPropertyList: CardProperty[] = [];
  private myName: string = '';

  constructor(
    private database: FireDatabaseService,
    private myUserInfo: MyUserInfoService,
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
    selectedCards: SelectedCards
  ) {
    const newRoom = new GameRoom();
    {
      newRoom.numberOfPlayers      = numberOfPlayers;
      newRoom.isSelectedExpansions = isSelectedExpansions;
      newRoom.memo                 = memo;
      newRoom.selectedCards        = selectedCards;
      newRoom.playerShuffler       = utils.number.random.permutation( numberOfPlayers );
      newRoom.initCards( this.cardPropertyList );
      newRoom.initDecks();
      newRoom.initialState.setNumberOfPlayers( numberOfPlayers );
      newRoom.initialState.usePotion = selectedCards.usePotion( this.cardPropertyList );
      newRoom.initialState.turnInfo = new TurnInfo({
            action: 1,
            buy:    1,
            coin:   0,
            potion: 0,
            phase:  '',
            runningCards: [],
        });
      if ( selectedCards.concatAllCards()
            .map( i => this.cardPropertyList[i].cardId )
            .includes('Baker')
      ) {
        newRoom.initialState.allPlayersData.forEach( p => p.vcoin++ );
      }
    }

    {
      const newComm = new GameCommunication();
      newComm.thinkingState = utils.number.seq0( numberOfPlayers ).map( _ => false );
      // 最初のプレイヤーの自動でgoToNextPhaseを1回発動
      newComm.userInputList.push( new UserInput( {
                                    command: 'clicked goToNextPhase',
                                    data: {
                                      playerId: 0,
                                      autoSort: true,
                                      shuffleBy: utils.number.random.permutation(10),
                                    }
                                  }, null ) );
      const result = await this.database.onlineGameCommunication.add( newComm );
      newRoom.gameRoomCommunicationId = result.key;
    }

    // make new GameRoom object
    {
      const result = await this.database.onlineGameRoom.add( newRoom );
      newRoom.databaseKey = result.key;
    }

    // add me to GameRoom object
    await this.database.onlineGameRoom.addMember( newRoom.databaseKey, this.myName );

    return newRoom;
  }

}
