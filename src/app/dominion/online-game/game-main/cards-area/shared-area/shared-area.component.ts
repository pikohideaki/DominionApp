import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { DCard, BasicCards, KingdomCards } from '../../../../../classes/game-state';

import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameStateService  } from '../../services/game-state-services/game-state.service';

@Component({
  selector: 'app-shared-area',
  templateUrl: './shared-area.component.html',
  styleUrls: ['./shared-area.component.css'],
})
export class SharedAreaComponent implements OnInit {
  Prosperity$           = this.myGameRoomService.Prosperity$;
  private BasicCards$   = this.gameStateService.BasicCards$;
  private KingdomCards$ = this.gameStateService.KingdomCards$;
  trashPile$            = this.gameStateService.trashPile$;

  @Input() showCardProperty$: Observable<boolean>;
  @Input() cardSizeRatio: number = 1;
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


  fade = 'fadeIn';



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

  onCardClick( value ) {
    this.cardClicked.emit( value );
  }


  // toggleFade() {
  //   console.log('triggerAnimation', this.fade);
  //   this.fade = (this.fade === 'fadeIn' ? 'fadeOut' : 'fadeIn');
  // }
}
