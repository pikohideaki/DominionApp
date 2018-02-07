import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mapTo';


import { PlayerCards } from '../../../../classes/game-state';
import { MyGameRoomService  } from '../my-game-room.service';
import { GameStateService } from '../game-state.service';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';


@Component({
  selector: 'app-other-player-area',
  templateUrl: './other-player-area.component.html',
  styleUrls: ['./other-player-area.component.css']
})
export class OtherPlayerAreaComponent implements OnInit {
  playersName$: Observable<string[]>
    = this.myGameRoomService.myGameRoom$.map( e => e.playersNameShuffled() );

  turnPlayerIndex$: Observable<number>
    = this.gameStateService.turnPlayerIndex$;

  private allPlayersCards$: Observable<PlayerCards[]>
    = this.gameStateService.allPlayersCards$.filter( arr => arr.length > 0 );

  @Output() cardClicked = new EventEmitter<any>();

  private playerIndice$
    = this.gameStateService.numberOfPlayers$.map( e => this.utils.seq0(e) )
        .startWith( [] );

  allPlayersCards$$
    = this.playerIndice$.map( indice => indice.map( i => ({
          Aside$     : this.allPlayersCards$.map( e => e[i].Aside     ),
          Deck$      : this.allPlayersCards$.map( e => e[i].Deck      ),
          HandCards$ : this.allPlayersCards$.map( e => e[i].HandCards ),
          Open$      : this.allPlayersCards$.map( e => e[i].Open      ),
          PlayArea$  : this.allPlayersCards$.map( e => e[i].PlayArea  ),
          DiscardPileReveresed$ :
            this.allPlayersCards$.map( e => this.utils.getReversed( e[i].DiscardPile ) ),
        }) ) );

  // ready$ = this.allPlayersCards$.mapTo( true ).startWith( false );


  constructor(
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private utils: UtilitiesService
  ) {
    // this.allPlayersCards$$.subscribe( val =>
    //   console.log('allPlayersCards$$', val ) );
  }

  ngOnInit() {
  }


  onClick( value ) {
    this.cardClicked.emit( value );
  }
}
