import { Component, OnInit, OnDestroy, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { MyGameStateService } from '../my-game-state.service';

import { CardProperty } from '../../../../classes/card-property';
import { PlayersCards } from '../../../../classes/game-room';


@Component({
  selector: 'app-turn-player-area',
  templateUrl: './turn-player-area.component.html',
  styleUrls: ['./turn-player-area.component.css']
})
export class TurnPlayerAreaComponent implements OnInit, OnDestroy {
  private alive: boolean = true;
  dataIsReady = false;
  turnPlayersCards: PlayersCards = new PlayersCards();
  @Output() private cardClicked = new EventEmitter<any>();


  constructor(
    private myGameStateService: MyGameStateService,
  ) {
    this.myGameStateService.turnPlayersCards$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.turnPlayersCards = val;
        this.dataIsReady = true;
      });
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
