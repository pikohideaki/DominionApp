import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgPipesModule } from 'ngx-pipes';

import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyOwnLibraryModule        } from '../../my-own-library/my-own-library.module';
import { SubComponentsModule       } from '../sub-components/sub-components.module';

import { OnlineGameComponent } from './online-game.component';
import { AddGameGroupComponent } from './add-game-group/add-game-group.component';
import { SignInToGameRoomDialogComponent } from './sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';
import { GameRoomListComponent } from './game-room-list/game-room-list.component';

import { GameMainComponent        } from './game-main/game-main.component';
import { ChatComponent            } from './game-main/chat/chat.component';
import { CardsPileComponent       } from './game-main/cards-area/cards-pile.component';
import { CardsLinedUpComponent    } from './game-main/cards-area/cards-lined-up.component';
import { TurnInfoComponent        } from './game-main/turn-info/turn-info.component';
import { SharedAreaComponent      } from './game-main/shared-area/shared-area.component';
import { OtherPlayerAreaComponent } from './game-main/other-players-area/other-players-area.component';
import { TurnPlayerAreaComponent  } from './game-main/turn-player-area/turn-player-area.component';
import { MyAreaComponent          } from './game-main/my-area/my-area.component';
import { SmallPlayerAreaComponent } from './game-main/other-players-area/small-player-area/small-player-area.component';
import { GameConfigDialogComponent      } from './game-main/game-config/game-config.component';
import { OnlineGameResultDialogComponent } from './game-main/online-game-result-dialog/online-game-result-dialog.component';
import { UserInputLogDialogComponent } from './game-main/game-main.component';

import { GameConfigService } from './game-main/game-config.service';
import { OnlineGamePlayerCardsDialogComponent, EachPlayerCardsComponent } from './game-main/online-game-result-player-cards/online-game-result-player-cards.component';



@NgModule({
  imports: [
    CommonModule,
    NgPipesModule,
    MyOwnCustomMaterialModule,
    MyOwnLibraryModule,
    SubComponentsModule,
  ],
  exports: [
    OnlineGameComponent,
    AddGameGroupComponent,
    GameRoomListComponent,
    SignInToGameRoomDialogComponent,
    GameMainComponent,
    UserInputLogDialogComponent,
    ChatComponent,
    CardsPileComponent,
    CardsLinedUpComponent,
    TurnInfoComponent,
    SharedAreaComponent,
    OtherPlayerAreaComponent,
    TurnPlayerAreaComponent,
  ],
  declarations: [
    OnlineGameComponent,
    AddGameGroupComponent,
    GameRoomListComponent,
    SignInToGameRoomDialogComponent,
    GameMainComponent,
    UserInputLogDialogComponent,
    ChatComponent,
    CardsPileComponent,
    CardsLinedUpComponent,
    TurnInfoComponent,
    SharedAreaComponent,
    OtherPlayerAreaComponent,
    TurnPlayerAreaComponent,
    MyAreaComponent,
    SmallPlayerAreaComponent,
    GameConfigDialogComponent,
    OnlineGameResultDialogComponent,
    OnlineGamePlayerCardsDialogComponent,
    EachPlayerCardsComponent,
  ],
  entryComponents: [
    SignInToGameRoomDialogComponent,
    GameConfigDialogComponent,
    UserInputLogDialogComponent,
    OnlineGameResultDialogComponent,
    OnlineGamePlayerCardsDialogComponent,
  ],
  providers: [
    GameConfigService,
  ]
})
export class OnlineGameModule { }
