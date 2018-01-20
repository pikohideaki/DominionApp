import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';

import { MatDialog, MatDialogRef } from '@angular/material';

import { MyUserInfoService             } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameRoom } from '../../../classes/game-room';


@Component({
  selector: 'app-sign-in-to-game-room-dialog',
  templateUrl: './sign-in-to-game-room-dialog.component.html',
  styleUrls: ['./sign-in-to-game-room-dialog.component.css']
})
export class SignInToGameRoomDialogComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() newRoom: GameRoom;
  @Input() dialogRef;
  playersName$: Observable<string[]>;
  selectedExpansions$: Observable<string[]>;

  allPlayersAreReady$: Observable<boolean>;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) { }

  ngOnInit() {
    this.myUserInfo.setOnlineGameRoomId( this.newRoom.databaseKey );
    this.myUserInfo.setOnlineGameStateId( this.newRoom.gameRoomCommunicationId );

  console.log(this.newRoom);
    // set Observables
    this.playersName$
      = this.database.onlineGameRooms$
          .map( list => ( list.find( e => e.databaseKey === this.newRoom.databaseKey )
                            || new GameRoom() ).playersName )
          .startWith([]);

    const selectingRoomRemoved$
      = this.database.onlineGameRooms$
          .map( list => list.findIndex( room => room.databaseKey === this.newRoom.databaseKey ) )
          .filter( result => result === -1 );

    this.allPlayersAreReady$
      = this.playersName$.map( e => e.length >= this.newRoom.numberOfPlayers )
          .startWith( false );

    this.selectedExpansions$
      = this.database.expansionsNameList$
          .map( val => val.filter( (_, i) => this.newRoom.isSelectedExpansions[i] ) )
          .startWith([]);


    // subscriptions
    selectingRoomRemoved$
      .takeWhile( () => this.alive )
      .subscribe( () => this.dialogRef.close() );

    this.allPlayersAreReady$
      .filter( e => e )
      .takeWhile( () => this.alive )
      .subscribe( () => {
        // this.database.onlineGameRoom.setWaitingForPlayersValue( this.newRoom.databaseKey, false );
        setTimeout( () => {
          this.router.navigate( ['/online-game-main'] );
          this.dialogRef.close();
        }, 1000);
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
