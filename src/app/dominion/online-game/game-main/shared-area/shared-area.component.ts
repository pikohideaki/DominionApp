import { Component, OnInit, OnDestroy, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { MyGameRoomService  } from '../my-game-room.service';
import { MyGameStateService } from '../my-game-state.service';

import { CardProperty } from '../../../../classes/card-property';
import {
    GameRoom,
    PlayersCards,
    BasicCards,
    KingdomCards
   } from '../../../../classes/game-room';

@Component({
  selector: 'app-shared-area',
  templateUrl: './shared-area.component.html',
  styleUrls: ['./shared-area.component.css']
})
export class SharedAreaComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  dataIsReady = false;

  Prosperity$:   Observable<boolean>;
  BasicCards$:   Observable<BasicCards>;
  KingdomCards$: Observable<KingdomCards>;
  TrashPile$:    Observable<number[]>;

  BasicCards: BasicCards = new BasicCards();

  @Output() private cardClicked = new EventEmitter<any>();


  constructor(
    private myGameRoomService: MyGameRoomService,
    private myGameStateService: MyGameStateService,
  ) {
    this.Prosperity$   = this.myGameRoomService.myGameRoom$.map( e => e.selectedCards.Prosperity );
    this.BasicCards$   = this.myGameStateService.BasicCards$;
    this.KingdomCards$ = this.myGameStateService.KingdomCards$;
    this.TrashPile$    = this.myGameStateService.TrashPile$;

    this.BasicCards$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.BasicCards = val;
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
