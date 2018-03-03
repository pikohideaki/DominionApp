import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { GameConfigService } from '../../services/game-config.service';
import { DCard } from '../../../../../classes/online-game/dcard';
import { PlayerCards } from '../../../../../classes/online-game/player-cards';


@Component({
  selector: 'app-turn-player-area',
  templateUrl: './turn-player-area.component.html',
  styleUrls: ['./turn-player-area.component.css']
})
export class TurnPlayerAreaComponent implements OnInit {

  @Output() cardClicked = new EventEmitter<DCard>();

  width$ = this.config.cardSizeRatio$.map( ratio => ratio * 50 );
  myIndex$ = this.gameRoomService.myIndex$;

  private turnPlayerCards$: Observable<PlayerCards>
    = this.gameStateService.turnPlayerCards$;

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
    private gameStateService: GameStateService,
    private gameRoomService: MyGameRoomService,
    private config: GameConfigService,
  ) {
  }

  ngOnInit() {
  }

  onClick( dcard: DCard ) {
    this.cardClicked.emit( dcard );
  }
}
