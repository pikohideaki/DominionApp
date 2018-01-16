import { Component, OnInit, OnDestroy, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { MyGameRoomService  } from '../my-game-room.service';
import { MyGameStateService } from '../my-game-state.service';

import { CardProperty } from '../../../../classes/card-property';
import {
    GameRoom,
    CommonCardData$$,
    CardDataForPlayer$$,
    PlayersCards
  } from '../../../../classes/game-room';

@Component({
  selector: 'app-other-player-area',
  templateUrl: './other-player-area.component.html',
  styleUrls: ['./other-player-area.component.css']
})
export class OtherPlayerAreaComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  dataIsReady = false;

  players: string[] = [];
  turnPlayerIndex$: Observable<number>;
  playersCards$:    Observable<PlayersCards[]>;

  @Output() private cardClicked = new EventEmitter<any>();


  constructor(
    private myGameRoomService: MyGameRoomService,
    private myGameStateService: MyGameStateService,
  ) {
    this.myGameRoomService.myGameRoom$.map( e => e.playersName )
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.players = val;
        this.dataIsReady = true;
      });

    this.turnPlayerIndex$ = this.myGameStateService.turnPlayerIndex$;
    this.playersCards$    = this.myGameStateService.playersCards$;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  onClick( value ) {
    this.cardClicked.emit( value );
  }
}
