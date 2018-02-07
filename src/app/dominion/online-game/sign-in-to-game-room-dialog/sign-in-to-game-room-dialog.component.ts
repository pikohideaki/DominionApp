import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';

import { MatDialog, MatDialogRef } from '@angular/material';

import { MyUserInfoService             } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameRoom } from '../../../classes/game-room';
import { SelectedCards } from '../../../classes/selected-cards';


@Component({
  selector: 'app-sign-in-to-game-room-dialog',
  templateUrl: './sign-in-to-game-room-dialog.component.html',
  styleUrls: ['./sign-in-to-game-room-dialog.component.css']
})
export class SignInToGameRoomDialogComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  newRoom: GameRoom;  // input
  dialogRef;  // input

  allPlayersAreReady$: Observable<boolean>;
  playersName$: Observable<string[]>;
  selectedExpansionNameList$: Observable<string[]>;
  selectedCards$: Observable<SelectedCards>;


  constructor(
    private router: Router,
    private dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) { }

  ngOnInit() {
    this.selectedCards$ = Observable.of( this.newRoom.selectedCards );

    this.myUserInfo.setOnlineGameRoomId( this.newRoom.databaseKey );
    this.myUserInfo.setGameCommunicationId( this.newRoom.gameRoomCommunicationId );

    // set Observables
    this.playersName$
      = this.database.onlineGameRooms$
          .map( list => ( list.find( e => e.databaseKey === this.newRoom.databaseKey )
                            || new GameRoom() ).playersNameShuffled() )
          .startWith([]);

    const selectingRoomRemoved$
      = this.database.onlineGameRooms$
          .map( list => !list.map( e => e.databaseKey )
                             .includes( this.newRoom.databaseKey ) );

    this.allPlayersAreReady$
      = this.playersName$.map( e => e.length >= this.newRoom.numberOfPlayers )
          .startWith( false );

    this.selectedExpansionNameList$
      = this.database.expansionNameList$
          .map( val => val.filter( (_, i) => this.newRoom.isSelectedExpansions[i] ) )
          .startWith([]);


    // subscriptions
    selectingRoomRemoved$.filter( e => e === true )
      .takeWhile( () => this.alive )
      .subscribe( () => this.dialogRef.close() );

    this.allPlayersAreReady$
      .filter( e => e === true )
      .takeWhile( () => this.alive )
      .delay( 1000 )
      .subscribe( () => {
        this.router.navigate( ['/online-game-main'] );
        this.dialogRef.close();
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
