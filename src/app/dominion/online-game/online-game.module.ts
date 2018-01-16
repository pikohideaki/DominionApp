import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyOwnLibraryModule        } from '../../my-own-library/my-own-library.module';
import { SubComponentsModule       } from '../sub-components/sub-components.module';

import { OnlineGameComponent } from './online-game.component';
import { AddGameGroupComponent } from './add-game-group/add-game-group.component';
import { SignInToGameRoomDialogComponent } from './sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    MyOwnLibraryModule,
    SubComponentsModule,
  ],
  exports: [
    OnlineGameComponent,
    AddGameGroupComponent,
    SignInToGameRoomDialogComponent,
  ],
  declarations: [
    OnlineGameComponent,
    AddGameGroupComponent,
    SignInToGameRoomDialogComponent,
  ],
  entryComponents: [
    SignInToGameRoomDialogComponent
  ]
})
export class OnlineGameModule { }
