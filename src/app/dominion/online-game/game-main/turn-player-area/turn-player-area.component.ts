import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { PlayerCards } from '../../../../classes/game-state';
import { GameStateService } from '../game-state.service';


@Component({
  selector: 'app-turn-player-area',
  templateUrl: './turn-player-area.component.html',
  styleUrls: ['./turn-player-area.component.css']
})
export class TurnPlayerAreaComponent implements OnInit {
  turnPlayerCards$: Observable<PlayerCards>;
  @Output() cardClicked = new EventEmitter<any>();

  constructor(
    private gameStateService: GameStateService
  ) {
    this.turnPlayerCards$ = this.gameStateService.turnPlayerCards$;
  }

  ngOnInit() {
  }

  onClick( value ) {
    this.cardClicked.emit( value );
  }
}
