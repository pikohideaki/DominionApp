import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';

import { GameConfigDialogComponent } from '../../dialogs/game-config-dialog/game-config-dialog.component';
import { UserInputLogDialogComponent } from './user-input-log-dialog.component';

import { GameStateService             } from '../../services/game-state-services/game-state.service';
import { MyGameRoomService            } from '../../services/my-game-room.service';
import { GameConfigService            } from '../../services/game-config.service';
import { GameRoomCommunicationService } from '../../services/game-room-communication.service';



@Component({
  selector: 'app-sidebar-left',
  templateUrl: './sidebar-left.component.html',
  styleUrls: ['./sidebar-left.component.css']
})
export class SideBarLeftComponent implements OnInit {

  @Input()  autoScroll$;
  @Output() autoScrollChange = new EventEmitter<boolean>();

  @Input() myIndex$;
  @Input() isMyTurn$;
  @Input() gameIsOver$;
  @Input() chatOpened$;
  @Input() isBuyPlayPhase$;
  @Input() myThinkingState$;

  @Output() logSnapshot                   = new EventEmitter<void>();
  @Output() toggleShowCardPropertyButtons = new EventEmitter<void>();
  @Output() toggleSideNav                 = new EventEmitter<void>();
  @Output() initialStateIsReadyChange     = new EventEmitter<boolean>();

  devMode$ = this.config.devMode$;


  constructor(
    private dialog: MatDialog,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameRoomCommunication: GameRoomCommunicationService,
    private config: GameConfigService,
  ) { }

  ngOnInit() {
  }



  toggleSideNavClicked() {
    this.toggleSideNav.emit();
  }

  toggleAutoScroll( value: boolean ) {
    this.autoScrollChange.emit( value );
  }

  toggleMyThinkingState( currentState: boolean, myIndex: number ) {
    this.gameRoomCommunication.setThinkingState( myIndex, !currentState );
  }

  goToNextPhase( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('clicked goToNextPhase', myIndex );
  }

  finishMyTurn( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('clicked finishMyTurn', myIndex );
  }

  sortMyHandCards( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('clicked sortHandcards', myIndex );
  }

  playAllTreasures( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput('play all treasures', myIndex );
  }

  toggleShowCardPropertyButtonsClicked() {
    this.toggleShowCardPropertyButtons.emit();
  }

  async settings() {
    const dialogRef = this.dialog.open( GameConfigDialogComponent );
    const result = await dialogRef.afterClosed().toPromise();
    if ( result === 'terminateGame' ) {
      this.gameRoomCommunication.setTerminatedState( true );
    }
    if ( result === 'resetGame' ) {
      this.gameRoomCommunication.setTerminatedState( false );
      this.initialStateIsReadyChange.emit( false );
      await this.gameRoomCommunication.removeAllUserInput();
      // 最初のプレイヤーの自動でgoToNextPhaseを1回発動
      await this.gameRoomCommunication.sendUserInput('clicked goToNextPhase', 0 );
    }
  }



  // developer mode
  incrementTurnCounter( myIndex ) {
    this.gameRoomCommunication.sendUserInput('increment turnCounter', myIndex );
  }

  logSnapshotClicked() {
    this.logSnapshot.emit();
  }

  userInputLog() {
    const dialogRef = this.dialog.open( UserInputLogDialogComponent );
    dialogRef.componentInstance.gameState$
      = this.gameStateService.gameState$;
    dialogRef.componentInstance.playersNameShuffled$
      = this.myGameRoomService.playersNameShuffled$;
    dialogRef.componentInstance.userInputList$
      = this.gameRoomCommunication.userInputList$;
  }


}
