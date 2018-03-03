import { Injectable } from '@angular/core';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

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
      newRoom.numberOfPlayers      = numberOfPlayers;
      newRoom.isSelectedExpansions = isSelectedExpansions;
      newRoom.memo                 = memo;
      newRoom.selectedCards        = selectCards;
      newRoom.playerShuffler       = this.utils.permutation( numberOfPlayers );
      newRoom.initCards( this.cardPropertyList );
      newRoom.initDecks();
      newRoom.initialState.setNumberOfPlayers( numberOfPlayers );
      newRoom.initialState.turnInfo = new TurnInfo({
            phase:  '',
            action: 1,
            buy:    1,
            coin:   0
        });
    }

    {
      const newComm = new GameCommunication();
      newComm.thinkingState = this.utils.seq0( numberOfPlayers ).map( _ => false );
      // 最初のプレイヤーの自動でgoToNextPhaseを1回発動
      newComm.userInputList.push( new UserInput( {
                                    command: 'clicked goToNextPhase',
                                    data: {
                                      playerId: 0,
                                      autoSort: true,
                                      shuffleBy: this.utils.permutation(10),
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
