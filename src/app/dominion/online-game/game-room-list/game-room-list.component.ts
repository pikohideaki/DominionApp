import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';

import { MatDialog, MatSnackBar } from '@angular/material';
import { ReversePipe } from 'ngx-pipes';

import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';

import { GameRoom } from '../../../classes/game-room';
import { SignInToGameRoomDialogComponent } from '../sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';


@Component({
  providers: [ReversePipe],
  selector: 'app-game-room-list',
  templateUrl: './game-room-list.component.html',
  styleUrls: ['./game-room-list.component.css']
})
export class GameRoomListComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  myName: string;
  gameRoomList: GameRoom[] = [];
  selectedRoomId = '';


  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
    this.database.onlineGameRooms$
      .takeWhile( () => this.alive )
      .subscribe( val => this.gameRoomList = val );

    this.myUserInfo.name$
      .takeWhile( () => this.alive )
      .subscribe( val => this.myName = val );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }


  roomClicked( clickedRoomId: string ) {
    if ( this.selectedRoomId === clickedRoomId ) this.selectedRoomId = '';  // toggle
    else this.selectedRoomId = clickedRoomId;
    event.stopPropagation();
  }

  backgroundClicked() {
    this.selectedRoomId = '';
  }

  async signIn( roomId: string ) {
    const dialogRef = this.dialog.open( SignInToGameRoomDialogComponent );

    dialogRef.componentInstance.newRoom
      = this.gameRoomList.find( g => g.databaseKey === roomId );

    dialogRef.componentInstance.dialogRef = dialogRef;
    dialogRef.disableClose = true;
    const myMemberId = this.database.onlineGameRoom.addMember( roomId, this.myName ).key;

    dialogRef.afterClosed().subscribe( result => {
      if ( result === 'Cancel Clicked' ) {
        this.database.onlineGameRoom.removeMember( roomId, myMemberId );
      } else {
        this.openSnackBar('Successfully signed in!');
      }
    });
  }

  resetRooms() {
    this.gameRoomList.map( e => e.gameRoomCommunicationId )
      .forEach( key => this.database.onlineGameCommunication.remove(key) );
    this.gameRoomList.map( e => e.databaseKey )
      .forEach( key => this.database.onlineGameRoom.remove(key) );
  }


  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }
}
