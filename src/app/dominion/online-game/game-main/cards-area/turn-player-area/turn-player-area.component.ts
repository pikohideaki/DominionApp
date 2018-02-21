import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { PlayerCards } from '../../../../../classes/game-state';

import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';


@Component({
  selector: 'app-turn-player-area',
  templateUrl: './turn-player-area.component.html',
  styleUrls: ['./turn-player-area.component.css']
})
export class TurnPlayerAreaComponent implements OnInit {

  private turnPlayerCards$: Observable<PlayerCards>
    = this.gameStateService.turnPlayerCards$;

  @Input() cardSizeRatio: number = 1;

  @Output() cardClicked = new EventEmitter<any>();

  turnPlayerCards = {
    Aside$     : this.turnPlayerCards$.map( e => e.Aside     ),
    Deck$      : this.turnPlayerCards$.map( e => e.Deck      ),
    HandCards$ : this.turnPlayerCards$.map( e => e.HandCards ),
    Open$      : this.turnPlayerCards$.map( e => e.Open      ),
    PlayArea$  : this.turnPlayerCards$.map( e => e.PlayArea  ),
    DiscardPileReveresed$ : this.turnPlayerCards$.map( e => this.utils.getReversed( e.DiscardPile ) ),
  };

  turnPlayersName$ = this.gameStateService.turnPlayersName$;



  constructor(
    private utils: UtilitiesService,
    private gameStateService: GameStateService
  ) {
  }

  ngOnInit() {
  }

  onClick( value ) {
    this.cardClicked.emit( value );
  }
}
