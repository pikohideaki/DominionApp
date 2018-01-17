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
import { GameMainComponent } from './game-main/game-main.component';

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
  ],
  declarations: [
    OnlineGameComponent,
    AddGameGroupComponent,
    GameRoomListComponent,
    SignInToGameRoomDialogComponent,
    GameMainComponent,
  ],
  entryComponents: [
    SignInToGameRoomDialogComponent
  ]
})
export class OnlineGameModule { }
