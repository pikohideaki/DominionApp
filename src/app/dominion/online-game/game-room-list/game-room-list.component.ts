import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';

import { MatDialog, MatSnackBar } from '@angular/material';
import { ReversePipe } from 'ngx-pipes';

import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { GameRoom } from '../../../classes/online-game/game-room';
import { SignInToGameRoomDialogComponent } from '../sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';
import { UserService } from '../../../firebase-mediator/user.service';
import { Router } from '@angular/router';
import { utils } from '../../../my-own-library/utilities';


@Component({
  providers: [ReversePipe],
  selector: 'app-game-room-list',
  templateUrl: './game-room-list.component.html',
  styleUrls: ['./game-room-list.component.css']
})
export class GameRoomListComponent implements OnInit {

  myName$ = this.user.name$;
  gameRoomList$: Observable<GameRoom[]> = this.database.onlineGameRooms$;
  selectedRoomId = '';
  inPlayGameId$: Observable<string> = this.user.onlineGame.roomId$;


  constructor(
    private router: Router,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private database: FireDatabaseService,
    private user: UserService
  ) {
  }

  ngOnInit() {
  }

  toYMDHMS = ( dat: Date ) => utils.date.toYMDHMS( dat );

  roomClicked( clickedRoomId: string ) {
    if ( this.selectedRoomId === clickedRoomId ) this.selectedRoomId = '';  // toggle
    else this.selectedRoomId = clickedRoomId;
    event.stopPropagation();
  }

  backgroundClicked() {
    this.selectedRoomId = '';
  }

  async signIn( room: GameRoom, myName: string ) {
    const dialogRef = this.dialog.open( SignInToGameRoomDialogComponent );
    const roomId = room.databaseKey;

    dialogRef.componentInstance.newRoom = room;

    dialogRef.componentInstance.dialogRef = dialogRef;
    dialogRef.disableClose = true;
    const myMemberId = this.database.onlineGameRoom.addMember( roomId, myName ).key;

    dialogRef.afterClosed().subscribe( result => {
      if ( result === 'Cancel Clicked' ) {
        this.database.onlineGameRoom.removeMember( roomId, myMemberId );
      } else {
        this.openSnackBar('Successfully signed in!');
      }
    });
  }

  resetRooms( gameRoomList: GameRoom[] ) {
    gameRoomList.map( e => e.gameRoomCommunicationId )
      .forEach( key => this.database.onlineGameCommunication.remove(key) );
    gameRoomList.map( e => e.databaseKey )
      .forEach( key => this.database.onlineGameRoom.remove(key) );
  }

  returnToGame() {
    this.router.navigate( ['/online-game-main'] );
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }
}
