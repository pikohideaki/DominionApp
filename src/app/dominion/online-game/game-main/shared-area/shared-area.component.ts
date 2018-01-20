import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { MyGameRoomService } from '../my-game-room.service';
import { GameStateService } from '../game-state.service';
import { DCard, BasicCards, KingdomCards } from '../../../../classes/game-state';

@Component({
  selector: 'app-shared-area',
  templateUrl: './shared-area.component.html',
  styleUrls: ['./shared-area.component.css']
})
export class SharedAreaComponent implements OnInit {
  Prosperity$:   Observable<boolean>;
  BasicCards$:   Observable<BasicCards>;
  KingdomCards$: Observable<KingdomCards>;
  trashPile$:    Observable<DCard[]>;

  @Output() private cardClicked = new EventEmitter<any>();


  constructor(
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
  ) {
    this.Prosperity$   = this.myGameRoomService.myGameRoom$.map( e => e.selectedCards.Prosperity );
    this.BasicCards$   = this.gameStateService.BasicCards$;
    this.KingdomCards$ = this.gameStateService.KingdomCards$;
    this.trashPile$    = this.gameStateService.trashPile$;
  }

  ngOnInit() {
  }

  onClick( value ) {
    this.cardClicked.emit( value );
  }
}
