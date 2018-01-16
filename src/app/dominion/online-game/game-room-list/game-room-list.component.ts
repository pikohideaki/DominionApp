import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { MatDialog, MatSnackBar } from '@angular/material';

import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';

import { GameRoom } from '../../../classes/game-room';
import { SignInToGameRoomDialogComponent } from '../sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';

@Component({
  selector: 'app-game-room-list',
  templateUrl: './game-room-list.component.html',
  styleUrls: ['./game-room-list.component.css']
})
export class GameRoomListComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() myName: string;
  gameRoomList: GameRoom[] = [];
  selectedRoomID = '';


  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
  ) {
    this.database.onlineGameRoomList$
      .takeWhile( () => this.alive )
      .subscribe( val => this.gameRoomList = val );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }


  signIn = async ( roomID: string ) => {
    const dialogRef = this.dialog.open( SignInToGameRoomDialogComponent );

    dialogRef.componentInstance.newRoom
      = this.gameRoomList.find( g => g.databaseKey === roomID );

    dialogRef.componentInstance.dialogRef = dialogRef;
    dialogRef.disableClose = true;
    const myMemberID = this.database.onlineGameRoom.addMember( roomID, this.myName ).key;

    dialogRef.afterClosed()
      .takeWhile( () => this.alive )
      .subscribe( result => {
        if ( result === 'Cancel Clicked' ) {
          this.database.onlineGameRoom.removeMember( roomID, myMemberID );
        } else {
          this.openSnackBar('Successfully signed in!');
        }
      });

  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }

  roomClicked( clickedRoomID: string ) {
    if ( this.selectedRoomID === clickedRoomID ) this.selectedRoomID = '';  // toggle
    else this.selectedRoomID = clickedRoomID;
    event.stopPropagation();
  }

  backgroundClicked() {
    this.selectedRoomID = '';
  }



  resetRooms() {
    this.gameRoomList.map( e => e.gameStateID ).forEach( key => this.database.onlineGameState.remove(key) );
    this.gameRoomList.map( e => e.databaseKey ).forEach( key => this.database.onlineGameRoom.remove(key) );
  }
}
