import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs/Observable';

import { GameResult } from '../../../../../classes/game-result';

import { ConfirmDialogComponent } from '../../../../../my-own-library/confirm-dialog.component';
import { OnlineGameResultDialogComponent } from '../../dialogs/online-game-result-dialog/online-game-result-dialog.component';
import { OnlineGamePlayerCardsDialogComponent } from '../../dialogs/online-game-result-player-cards-dialog/online-game-result-player-cards-dialog.component';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameRoomCommunicationService } from '../../services/game-room-communication.service';
import { FireDatabaseService } from '../../../../../firebase-mediator/cloud-firestore-mediator.service';


@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html',
  styleUrls: ['./sidebar-right.component.css']
})
export class SideBarRightComponent implements OnInit {

  @Input() gameResult$: Observable<GameResult>;
  myIndex$ = this.myGameRoomService.myIndex$;


  constructor(
    private router: Router,
    private dialog: MatDialog,
    private database: FireDatabaseService,
    private gameStateService: GameStateService,
    private myGameRoomService: MyGameRoomService,
    private gameCommunication: GameRoomCommunicationService,
  ) { }

  ngOnInit() {
  }


  showGameResultDialog() {
    const dialogRef = this.dialog.open( OnlineGameResultDialogComponent );
    dialogRef.componentInstance.gameResult$ = this.gameResult$;
    dialogRef.componentInstance.cardPropertyList$ = this.database.cardPropertyList$;
  }

  showPlayerCards() {
    const dialogRef = this.dialog.open( OnlineGamePlayerCardsDialogComponent );
    dialogRef.componentInstance.allPlayersCards$ = this.gameStateService.allPlayersCards$;
    dialogRef.componentInstance.playersNameList$ = this.myGameRoomService.playersNameShuffled$;
  }

  exit( myIndex: number ) {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message
      = '退室しますか？（退室しても新しいゲームを始めるまではこの画面に戻ることができます。）';
    dialogRef.afterClosed().subscribe( yn => {
      if ( yn === 'yes' ) {
        this.router.navigate( ['/online-game'] );
        this.gameCommunication.setPresenceState( myIndex, false );
        this.gameCommunication.sendMessage( '', 'leaveTheRoom' );
      }
    });
  }
}
