import { Component, OnInit, OnDestroy } from '@angular/core';

import { GameConfigService   } from '../../services/game-config.service';
import { TransitStateService } from '../../services/game-state-services/transit-state.service';
import { GameStateService    } from '../../services/game-state-services/game-state.service';
import { UtilitiesService } from '../../../../../my-own-library/utilities.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



@Component({
  selector: 'app-game-config-dialog',
  templateUrl: './game-config-dialog.component.html',
  styleUrls: ['./game-config-dialog.component.css'],
})
export class GameConfigDialogComponent implements OnInit, OnDestroy {
  private alive = true;

  cardSizeAutoChange$   = this.config.cardSizeAutoChange$;
  cardSizeRatio$        = this.config.cardSizeRatio$;
  messageMillisec$      = this.config.messageMillisec$;
  devMode$              = this.config.devMode$;
  autoSort$             = this.config.autoSort$;

  messageSecRounded$ = this.messageMillisec$.map( ms => Math.round( ms / 100 ) / 10 );

  resetGameKeyword: number = this.utils.randInt( 1000, 9999 );
  input: number = 0;

  private cardSizeSliderOnInputSource = new BehaviorSubject<number>(0);
  private cardSizeSliderOnInput$ = this.cardSizeSliderOnInputSource.asObservable().skip(1);

  private messageMillisecSliderOnInputSource = new BehaviorSubject<number>(0);
  private messageMillisecSliderOnInput$ = this.messageMillisecSliderOnInputSource.asObservable().skip(1);




  constructor(
    private utils: UtilitiesService,
    private config: GameConfigService
  ) {
    const sliderOnInputDebounceTime = 500 /* ms */;

    this.cardSizeSliderOnInput$
      .debounceTime( sliderOnInputDebounceTime )
      .takeWhile( () => this.alive )
      .subscribe( val => this.setCardSizeRatio( val ) );

    this.messageMillisecSliderOnInput$
      .debounceTime( sliderOnInputDebounceTime )
      .takeWhile( () => this.alive )
      .subscribe( val => this.setMessageMillisec( val ) );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
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

  resetMessageMillisec() {
    this.config.setMessageMillisec( 1.0 );
  }

  setAutoSort( value: boolean ) {
    this.config.setAutoSort( value );
  }

  cardSizeSliderOnInput( value: number ) {
    this.cardSizeSliderOnInputSource.next( value );
  }
  private setCardSizeRatio( value: number ) {
    this.config.setCardSizeRatio( value / 100 );
  }

  messageMillisecSliderOnInput( millisec: number ) {
    this.messageMillisecSliderOnInputSource.next( millisec );
  }
  private setMessageMillisec( millisec: number ) {
    this.config.setMessageMillisec( millisec );
  }

}
