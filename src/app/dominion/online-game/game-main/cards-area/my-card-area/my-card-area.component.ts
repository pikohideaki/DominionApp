import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { PlayerCards, DCard } from '../../../../../classes/game-state';

import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { GameConfigService } from '../../services/game-config.service';


@Component({
  selector: 'app-my-card-area',
  templateUrl: './my-card-area.component.html',
  styleUrls: ['./my-card-area.component.css']
})
export class MyCardAreaComponent implements OnInit {

  @Input() showCardProperty$: Observable<boolean>;
  @Output() cardClicked = new EventEmitter<DCard>();

  width$ = this.config.cardSizeRatio$.map( ratio => ratio * 70 );
  myIndex$ = this.gameRoomService.myIndex$;
  isMyTurn$ = this.gameStateService.isMyTurn$;

  private myCards$: Observable<PlayerCards>
    = this.gameStateService.myCards$;

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
