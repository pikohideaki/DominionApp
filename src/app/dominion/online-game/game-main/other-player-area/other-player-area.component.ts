import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { PlayerCards } from '../../../../classes/game-state';
import { MyGameRoomService  } from '../my-game-room.service';
import { GameStateService } from '../game-state.service';


@Component({
  selector: 'app-other-player-area',
  templateUrl: './other-player-area.component.html',
  styleUrls: ['./other-player-area.component.css']
})
export class OtherPlayerAreaComponent implements OnInit {
  playersName$: Observable<string[]>;
  turnPlayerIndex$: Observable<number>;
  allPlayersCards$: Observable<PlayerCards[]>;

  @Output() cardClicked = new EventEmitter<any>();


  constructor(
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService
  ) {
    // observables
    this.turnPlayerIndex$ = this.gameStateService.turnPlayerIndex$;
    this.allPlayersCards$ = this.gameStateService.allPlayersCards$;
    this.playersName$     = this.myGameRoomService.myGameRoom$.map( e => e.playersName );
  }

  ngOnInit() {
  }

  onClick( value ) {
    this.cardClicked.emit( value );
  }
}
