import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ConfirmDialogComponent } from '../../../../my-own-library/confirm-dialog.component';

import { MessageForMeListDialogComponent } from '../dialogs/message-for-me-dialog-list.component';
import { GameRoomCommunicationService } from '../services/game-room-communication.service';

@Component({
  selector: 'app-my-area',
  templateUrl: './my-area.component.html',
  styleUrls: ['./my-area.component.css']
})
export class MyAreaComponent implements OnInit {

  @Input() isMyTurn$;
  @Input() isBuyPlayPhase$;
  @Input() messageForMe$;
  @Input() messageForMeList$;
  @Input() myIndex$;
  @Input() autoSort$;
  @Input() showCardProperty$;
  @Input() gameIsOver$;
  @Input() myThinkingState$;

  @Output() cardClicked = new EventEmitter<any>();

  constructor(
    private dialog: MatDialog,
    private gameRoomCommunication: GameRoomCommunicationService,
  ) { }

  ngOnInit() {
  }


  showMessageHistory( messageForMeList: string[] ) {
    const dialogRef = this.dialog.open( MessageForMeListDialogComponent );
    dialogRef.componentInstance.messageForMeList = messageForMeList;
  }

  onCardClick( value ) {
    this.cardClicked.emit( value );
  }


  toggleMyThinkingState( currentState: boolean, myIndex: number ) {
    this.gameRoomCommunication.setThinkingState( myIndex, !currentState );
  }


  async goToNextPhase( myIndex: number, autoSort: boolean ) {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message = '次のフェーズに移動します。';
    const yn = await dialogRef.afterClosed().toPromise();
    if ( yn === 'yes' ) {
      this.gameRoomCommunication.sendUserInput(
          'clicked goToNextPhase', myIndex, autoSort );
    }
  }

  async finishMyTurn( myIndex: number, autoSort: boolean ) {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message = 'ターンを終了します。';
    const yn = await dialogRef.afterClosed().toPromise();
    if ( yn === 'yes' ) {
      this.gameRoomCommunication.sendUserInput(
          'clicked finishMyTurn', myIndex, autoSort );
    }
  }

  sortMyHandCards( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput(
        'clicked sortHandcards', myIndex, false );
  }

  playAllTreasures( myIndex: number, autoSort: boolean ) {
    this.gameRoomCommunication.sendUserInput(
        'play all treasures', myIndex, autoSort );
  }


}
