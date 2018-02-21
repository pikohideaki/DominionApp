import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty } from '../../../../classes/card-property';
import { DCard } from '../../../../classes/game-state';
import { MyGameRoomService } from '../my-game-room.service';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';
import { MatDialog } from '@angular/material';
import { CardPropertyDialogComponent } from '../../../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-cards-pile',
  templateUrl: './cards-pile.component.html',
  styleUrls: ['./cards-area.css', './cards-pile.component.css'],
})
export class CardsPileComponent implements OnInit {

  @Input() displaySize: boolean = true;
  @Input() showCardProperty: boolean = false;
  @Input() DCardArray$: Observable<DCard[]>;
  @Input() width: number;
  @Output() cardClicked = new EventEmitter<DCard>();

  private myIndex$ = this.myGameRoomService.myIndex$;

  faceUp$:      Observable<boolean>;
  isButton$:    Observable<boolean>;
  empty$:       Observable<boolean>;
  description$: Observable<string>;
  card$:        Observable<CardProperty>;

  topDCard$:    Observable<DCard>;


  DCardArraySize$:  Observable<number>;
  topDCardCostStr$: Observable<string>;

  tooltipNameStr$: Observable<string>;
  tooltipSizeStr$: Observable<string>;
  tooltipCostStr$: Observable<string>;


  constructor(
    private myGameRoomService: MyGameRoomService,
    private utils: UtilitiesService,
    private dialog: MatDialog
  ) {
  }


  ngOnInit() {
    const isEmpty = DCardArray => ( !DCardArray || DCardArray.length === 0 );

    this.topDCard$ = this.DCardArray$.map( DCardArray =>
        ( isEmpty( DCardArray ) ? new DCard() : DCardArray[0] ) );

    this.empty$ = this.DCardArray$.map( isEmpty ).distinctUntilChanged();

    this.faceUp$ = Observable.combineLatest(
        this.empty$, this.topDCard$, this.myIndex$,
        (empty, topDCard, myIndex) =>
          (empty ? false : topDCard.faceUp[ myIndex ] ) )
      .distinctUntilChanged();

    this.isButton$ = Observable.combineLatest(
        this.empty$, this.topDCard$, this.myIndex$,
        (empty, topDCard, myIndex) =>
          (empty ? false : topDCard.isButton[ myIndex ] ) )
      .distinctUntilChanged();

    this.description$
      = this.topDCard$.map( topDCard => topDCard.id.toString() )
          .distinctUntilChanged();

    this.card$ = this.topDCard$.map( c => c.cardProperty );

    this.DCardArraySize$ = this.DCardArray$.map( e => e.length );

    this.topDCardCostStr$
      = this.topDCard$.map( d => d.cardProperty.cost.toStr() );

    this.tooltipNameStr$
      = this.topDCard$.map( dcard => dcard.cardProperty.nameJp );

    this.tooltipSizeStr$
      = this.DCardArraySize$.map( size => `${size}枚` );

    this.tooltipCostStr$
      = this.topDCard$.map( dcard => {
          const cost = dcard.cardProperty.cost;
          let result = `コスト：${cost.coin}コイン`;
          if ( cost.potion > 0 ) {
            result += `，${cost.potion}ポーション`;
          }
          if ( cost.debt > 0 ) {
            result += `，${cost.debt}借金`;
          }
          return result;
        });

    // this.DCardArray$.subscribe( e => console.log('pile::DCardArray$', e ) );
  }


  onClickedIfIsButton( isButton: boolean, topCard: DCard ) {
    if ( !isButton ) return;
    this.cardClicked.emit( topCard );
  }

  openCardPropertyDialog( dcard: DCard ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    dialogRef.componentInstance.indiceInCardList$ = Observable.of( [dcard.cardProperty.indexInList] );
  }
}
