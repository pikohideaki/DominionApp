import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { DCard } from '../../../../../../classes/game-state';
import { CardPropertyDialogComponent } from '../../../../../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-card-image-wrapper',
  templateUrl: './card-image-wrapper.component.html',
  styleUrls: ['./card-image-wrapper.component.css']
})
export class CardImageWrapperComponent implements OnInit {

  @Input() showArraySize:    boolean;
  @Input() showCardProperty: boolean;

  @Input() width$: Observable<number>;
  fontSize$: Observable<number>;

  @Input() indexInArray: number;
  @Input() DCardArray$:  Observable<DCard[]>;
  DCardArraySize$:       Observable<number>;
  DCard$:                Observable<DCard>;
  DCardCostStr$:         Observable<string>;
  tooltipNameStr$:       Observable<string>;
  tooltipSizeStr$:       Observable<string>;
  tooltipCostStr$:       Observable<string>;

  @Input() myIndex$: Observable<number>;
  faceUp$:           Observable<boolean>;
  isButton$:         Observable<boolean>;
  empty$:            Observable<boolean>;

  @Output() cardClicked = new EventEmitter<DCard>();


  constructor(
    private dialog: MatDialog
  ) { }


  ngOnInit() {
    this.empty$ = this.DCardArray$.map( ar => !ar || ar.length === 0 );

    this.DCard$ = this.DCardArray$.map( ar => ar[ this.indexInArray ] || new DCard() );

    this.fontSize$
      = this.width$.map( width => width / 50 /* em */ );

    this.DCardCostStr$
      = this.DCard$.map( d => d.cardProperty.cost.toStr() );

    this.DCardArraySize$ = this.DCardArray$.map( e => e.length );

    this.tooltipSizeStr$ = this.DCardArraySize$.map( size => `${size}枚` );

    this.tooltipNameStr$
      = this.DCard$.map( dcard => dcard.cardProperty.nameJp );

    this.tooltipCostStr$
      = this.DCard$.map( dcard => {
          const cost = dcard.cardProperty.cost;
          let result = `コスト：${cost.coin}コイン`;
          if ( cost.potion > 0 ) result += `，${cost.potion}ポーション`;
          if ( cost.debt   > 0 ) result += `，${cost.debt}借金`;
          return result;
        });

    this.faceUp$
      = this.DCard$.combineLatest( this.myIndex$,
            (dcard, myindex) => dcard.faceUp[ myindex ] )
          .distinctUntilChanged();

    this.isButton$
      = this.DCard$.combineLatest( this.myIndex$,
            (dcard, myindex) => dcard.isButton[ myindex ] )
          .distinctUntilChanged();

  }

  onClicked( dcard: DCard ) {
    if ( dcard.isButton ) {
      this.cardClicked.emit( dcard );
    }
  }


  openCardPropertyDialog( dcard: DCard ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    dialogRef.componentInstance.indiceInCardList$
      = Observable.of( [dcard.cardProperty.indexInList] );
  }
}
