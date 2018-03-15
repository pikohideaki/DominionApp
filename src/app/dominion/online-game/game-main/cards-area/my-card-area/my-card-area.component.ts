import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { utils } from '../../../../../my-own-library/utilities';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { GameConfigService } from '../../services/game-config.service';
import { DCard } from '../../../../../classes/online-game/dcard';
import { PlayerCards } from '../../../../../classes/online-game/player-cards';


@Component({
  selector: 'app-my-card-area',
  templateUrl: './my-card-area.component.html',
  styleUrls: ['./my-card-area.component.css']
})
export class MyCardAreaComponent implements OnInit {

  @Input() showCardProperty$: Observable<boolean>;
  @Input() buttonizeVCoins: boolean = false;
  @Input() buttonizeDebts:  boolean = false;
  @Output() cardClicked = new EventEmitter<DCard>();
  @Output() vcoinClicked = new EventEmitter<void>();
  @Output() debtClicked = new EventEmitter<void>();

  width$    = this.config.cardSizeRatio$.map( ratio => ratio * 70 );
  myIndex$  = this.gameRoomService.myIndex$;
  isMyTurn$ = this.gameStateService.isMyTurn$;
  VPtoken$  = this.gameStateService.myData$.map( e => e.VPtoken ).distinctUntilChanged();
  vcoin$    = this.gameStateService.myData$.map( e => e.vcoin   ).distinctUntilChanged();
  debt$     = this.gameStateService.myData$.map( e => e.debt    ).distinctUntilChanged();

  private myCards$: Observable<PlayerCards>
    = this.gameStateService.myCards$;

  myCards = {
    Aside$     : this.myCards$.map( e => e.Aside     ),
    Deck$      : this.myCards$.map( e => e.Deck      ),
    HandCards$ : this.myCards$.map( e => e.HandCards ),
    Open$      : this.myCards$.map( e => e.Open      ),
    PlayArea$  : this.myCards$.map( e => e.PlayArea  ),
    DiscardPileReveresed$ : this.myCards$.map( e => utils.array.getReversed( e.DiscardPile ) ),
  };



  constructor(
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

  vcoinClick() {
    this.vcoinClicked.emit();
  }

  debtClick() {
    this.debtClicked.emit();
  }
}
