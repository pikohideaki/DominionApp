import { Component, OnInit } from '@angular/core';

import { GameConfigService   } from '../../services/game-config.service';
import { UtilitiesService } from '../../../../../my-own-library/utilities.service';


@Component({
  selector: 'app-game-config-dialog',
  templateUrl: './game-config-dialog.component.html',
  styleUrls: ['./game-config-dialog.component.css'],
})
export class GameConfigDialogComponent implements OnInit {

  cardSizeAutoChange$ = this.config.cardSizeAutoChange$;
  cardSizeRatio$      = this.config.cardSizeRatio$;
  messageSec$         = this.config.messageSec$;
  devMode$            = this.config.devMode$;
  autoSort$           = this.config.autoSort$;

  resetGameKeycode: number = this.utils.randInt( 1000, 9999 );
  keycode: number = 0;

  round = ((num: number) => Math.round( num * 10 ) / 10 );


  constructor(
    private utils: UtilitiesService,
    private config: GameConfigService
  ) {
  }

  ngOnInit() {
  }


  toggleDevMode( value: boolean ) {
    this.config.setDevMode( !value );
  }

  keycodeOnInput( value: number ) {
    this.keycode = value;
  }

  cardSizeAutoChangeChecked( value: boolean ) {
    this.config.setCardSizeAutoChange( value );
  }

  setCardSizeRatio( value: number ) {
    this.config.setCardSizeRatio( value );
  }

  setMessageSec( sec: number ) {
    this.config.setMessageSec( sec );
  }

  setAutoSort( value: boolean ) {
    this.config.setAutoSort( value );
  }

  smartphoneMode() {
    this.config.setCardSizeAutoChange( true );
    this.config.setCardSizeRatio( 0.5 );
  }

}
