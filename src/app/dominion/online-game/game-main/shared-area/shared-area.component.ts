import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { MyGameRoomService } from '../my-game-room.service';
import { GameStateService } from '../game-state.service';
import { DCard, BasicCards, KingdomCards } from '../../../../classes/game-state';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';

@Component({
  selector: 'app-shared-area',
  templateUrl: './shared-area.component.html',
  styleUrls: ['./shared-area.component.css']
})
export class SharedAreaComponent implements OnInit {
  Prosperity$: Observable<boolean>
    = this.myGameRoomService.myGameRoom$.map( e => e.selectedCards.Prosperity );
  private BasicCards$: Observable<BasicCards>
    = this.gameStateService.BasicCards$;
  private KingdomCards$: Observable<KingdomCards>
    = this.gameStateService.KingdomCards$;
  trashPile$: Observable<DCard[]>
    = this.gameStateService.trashPile$;

  @Output() private cardClicked = new EventEmitter<any>();

  BasicCards = {
    Copper$   : this.BasicCards$.map( e => e.Copper   ),
    Silver$   : this.BasicCards$.map( e => e.Silver   ),
    Gold$     : this.BasicCards$.map( e => e.Gold     ),
    Platinum$ : this.BasicCards$.map( e => e.Platinum ),
    Estate$   : this.BasicCards$.map( e => e.Estate   ),
    Duchy$    : this.BasicCards$.map( e => e.Duchy    ),
    Province$ : this.BasicCards$.map( e => e.Province ),
    Colony$   : this.BasicCards$.map( e => e.Colony   ),
    Curse$    : this.BasicCards$.map( e => e.Curse    ),
  };

  KingdomCards = this.utils.seq0(10).map( i => this.KingdomCards$.map( e => e[i] ) );


  constructor(
    private utils: UtilitiesService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
  ) {
    // this.BasicCards$   .subscribe( val => console.log('this.BasicCards$'   , val ) );
    // this.KingdomCards$ .subscribe( val => console.log('this.KingdomCards$' , val ) );
    // this.Prosperity$   .subscribe( val => console.log('this.Prosperity$'   , val ) );
    // this.trashPile$    .subscribe( val => console.log('this.trashPile$'    , val ) );
  }

  ngOnInit() {
  }

  onClick( value ) {
    this.cardClicked.emit( value );
  }
}
