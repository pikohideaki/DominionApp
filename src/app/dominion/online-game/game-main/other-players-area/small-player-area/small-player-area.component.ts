import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { PlayerCards } from '../../../../../classes/game-state';
import { GameStateService } from '../../game-state-services/game-state.service';
import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { MyGameRoomService } from '../../my-game-room.service';


@Component({
  selector: 'app-small-player-area',
  templateUrl: './small-player-area.component.html',
  styleUrls: ['./small-player-area.component.css']
})
export class SmallPlayerAreaComponent implements OnInit {

  @Input() cardSizeRatio: number = 1;
  @Input() playerName: string;
  @Input() playerIndex: number;
  @Input() thinkingState: boolean = false;

  turnPlayerIndex$ = this.gameStateService.turnPlayerIndex$;
  myIndex$ = this.myGameRoomService.myIndex$;

  @Output() cardClicked = new EventEmitter<any>();

  playerCards;


  constructor(
    private utils: UtilitiesService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService
  ) {
  }

  ngOnInit() {
    const playerCards$
      = this.gameStateService.allPlayersCards$
          .filter( e => e.length > this.playerIndex )
          .map( e => e[ this.playerIndex ] );

    this.playerCards = {
      Aside$     : playerCards$.map( e => e.Aside     ),
      Deck$      : playerCards$.map( e => e.Deck      ),
      HandCards$ : playerCards$.map( e => e.HandCards ),
      Open$      : playerCards$.map( e => e.Open      ),
      PlayArea$  : playerCards$.map( e => e.PlayArea  ),
      DiscardPileReveresed$ : playerCards$.map( e => this.utils.getReversed( e.DiscardPile ) ),
    };

  }

  onCardClick( value ) {
    this.cardClicked.emit( value );
  }
}
