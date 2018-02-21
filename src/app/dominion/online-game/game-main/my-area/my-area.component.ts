import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { PlayerCards } from '../../../../classes/game-state';
import { GameStateService } from '../game-state-services/game-state.service';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';


@Component({
  selector: 'app-my-area',
  templateUrl: './my-area.component.html',
  styleUrls: ['./my-area.component.css']
})
export class MyAreaComponent implements OnInit {

  @Input() showCardProperty$: Observable<boolean>;

  private myCards$: Observable<PlayerCards>
    = this.gameStateService.myCards$;

  isMyTurn$ = this.gameStateService.isMyTurn$;

  @Input() cardSizeRatio: number = 1;

  @Output() cardClicked = new EventEmitter<any>();

  myCards = {
    Aside$     : this.myCards$.map( e => e.Aside     ),
    Deck$      : this.myCards$.map( e => e.Deck      ),
    HandCards$ : this.myCards$.map( e => e.HandCards ),
    Open$      : this.myCards$.map( e => e.Open      ),
    PlayArea$  : this.myCards$.map( e => e.PlayArea  ),
    DiscardPileReveresed$ : this.myCards$.map( e => this.utils.getReversed( e.DiscardPile ) ),
  };


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
