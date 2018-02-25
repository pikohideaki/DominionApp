import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DCard } from '../../../../../../classes/game-state';
import { GameConfigService } from '../../../services/game-config.service';
import { UtilitiesService } from '../../../../../../my-own-library/utilities.service';


@Component({
  selector: 'app-cards-lined-up',
  templateUrl: './cards-lined-up.component.html',
  styles: [`
    .card-images-lined-up {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
    .card-image-in-line {
      padding-bottom: 4px;
    }
  `],

})
export class CardsLinedUpComponent implements OnInit {

  @Input() showCardProperty: boolean = false;
  @Input() DCardArray$: Observable<DCard[]>;
  @Input() myIndex$: Observable<number>;

  @Input() width$: Observable<number>;
  @Input() defaultArrayLength: number = 1;  // min-width
  widthShrunk$: Observable<number>; // カードの枚数が増えるごとにカードサイズを縮小
  lineMinWidth$: Observable<number>;
  padding = 2 /* px */;

  @Output() cardClicked = new EventEmitter<DCard>();

  empty$: Observable<boolean>;
  indice$: Observable<number[]>;

  // @Input() overlayDisplay: boolean = false;
  // @Input() maxLineWidth: number;


  constructor(
    private utils: UtilitiesService,
    private config: GameConfigService,
  ) {
  }

  ngOnInit() {
    this.empty$ = this.DCardArray$.map( ar => !ar || ar.length === 0 );

    this.indice$
      = this.DCardArray$.map( ar => ar.length ).distinctUntilChanged()
          .map( length => this.utils.seq0( length ) );

    this.widthShrunk$
      = Observable.combineLatest(
            this.width$,
            this.DCardArray$.map( e => e.length ).distinctUntilChanged(),
            this.config.cardSizeAutoChange$,
            (width, size, autoChange) =>
                width * ( 1.0 - ( autoChange ? size / 100 : 0 ) ) )
                // autoChange --> (1 - (カード枚数 / 100))倍
          .debounceTime(100);

    this.lineMinWidth$
      = this.widthShrunk$.map( width =>
          (width + this.padding) * this.defaultArrayLength );

  }


  onClicked( dcard: DCard ) {
    this.cardClicked.emit( dcard );
  }
}
