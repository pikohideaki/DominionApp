import { Component, OnInit } from '@angular/core';

import { GameConfigService   } from '../../services/game-config.service';
import { TransitStateService } from '../../services/game-state-services/transit-state.service';
import { GameStateService    } from '../../services/game-state-services/game-state.service';



@Component({
  selector: 'app-game-config-dialog',
  templateUrl: './game-config-dialog.component.html',
  styleUrls: ['./game-config-dialog.component.css'],
})
export class GameConfigDialogComponent implements OnInit {

  cardSizeAutoChange$ = this.config.cardSizeAutoChange$;
  cardSizeRatio$      = this.config.cardSizeRatio$;
  messageSpeed$       = this.config.messageSpeed$;
  devMode$            = this.config.devMode$;

  resetGameKeyword: number = Date.now() % 10000;
  input: number = 0;


  constructor(
    private config: GameConfigService
  ) { }

  ngOnInit() {
  }

  inputStringOnChange( value: number ) {
    this.input = value;
  }

  cardSizeAutoChangeChecked( value: boolean ) {
    this.config.setCardSizeAutoChange( value );
  }

  toggleDevMode( value: boolean ) {
    this.config.setDevMode( !value );
  }

  setCardSizeRatio( value: number ) {
    this.config.setCardSizeRatio( value / 100 );
  }

  setMessageSpeed( value: number ) {
    this.config.setMessageSpeed( value / 100 );
  }

  resetMessageSpeed() {
    this.config.setMessageSpeed( 1.0 );
  }
}
