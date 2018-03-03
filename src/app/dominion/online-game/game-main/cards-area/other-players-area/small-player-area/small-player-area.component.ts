import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { UtilitiesService } from '../../../../../../my-own-library/utilities.service';
import { MyGameRoomService } from '../../../services/my-game-room.service';
import { GameStateService  } from '../../../services/game-state-services/game-state.service';
import { GameConfigService } from '../../../services/game-config.service';
import { DCard } from '../../../../../../classes/online-game/dcard';


@Component({
  selector: 'app-small-player-area',
  templateUrl: './small-player-area.component.html',
  styleUrls: ['./small-player-area.component.css']
})
export class SmallPlayerAreaComponent implements OnInit {

  @Output() cardClicked = new EventEmitter<DCard>();

  width$ = this.config.cardSizeRatio$.map( ratio => ratio * 40 );
  myIndex$ = this.gameRoomService.myIndex$;
  turnPlayerIndex$ = this.gameStateService.turnPlayerIndex$;

  @Input() playerName: string;
  @Input() playerIndex: number;
  @Input() thinkingState: boolean = false;

  playerCards;


  constructor(
    private utils: UtilitiesService,
    private gameStateService: GameStateService,
    private gameRoomService: MyGameRoomService,
    private config: GameConfigService,
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

  onClick( dcard: DCard ) {
    this.cardClicked.emit( dcard );
  }
}
