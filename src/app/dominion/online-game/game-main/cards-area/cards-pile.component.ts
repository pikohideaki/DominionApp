import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty } from '../../../../classes/card-property';
import { DCard } from '../../../../classes/game-state';
import { MyGameRoomService } from '../my-game-room.service';
import { UtilitiesService } from '../../../../my-own-library/utilities.service';


@Component({
  selector: 'app-cards-pile',
  templateUrl: './cards-pile.component.html',
  styles: [],
})
export class CardsPileComponent implements OnInit {

  @Input() private DCardArray$: Observable<DCard[]>;
  @Input() width: number;
  @Output() cardClicked = new EventEmitter<DCard>();

  private cardPropertyList$ = this.database.cardPropertyList$;
  private myIndex$ = this.myGameRoomService.myIndex$;

  faceUp$:      Observable<boolean>;
  isButton$:    Observable<boolean>;
  empty$:       Observable<boolean>;
  description$: Observable<string>;
  card$:        Observable<CardProperty>;

  topDCard$:    Observable<DCard>;


  constructor(
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService,
    private utils: UtilitiesService
  ) {
  }


  ngOnInit() {
    const isEmpty = DCardArray => ( !DCardArray || DCardArray.length === 0 );

    this.topDCard$ = this.DCardArray$.map( DCardArray =>
        ( isEmpty( DCardArray ) ? new DCard() : DCardArray[0] ) );

    // this.topDCard$.subscribe( val => console.log('topDCard', val ) );

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
      // = this.topDCard$.map( topDCard => '' )
      = this.topDCard$.map( topDCard => topDCard.id.toString() )
          .distinctUntilChanged();

    this.card$ = Observable.combineLatest(
        this.cardPropertyList$,
        this.topDCard$,
        (cardPropertyList, topDCard) =>
          cardPropertyList[ topDCard.cardListIndex ] );


    // this.card$.subscribe( e => console.log('card$', e ) );
    // this.faceUp$.subscribe( e => console.log('faceUp$', e ) );
    // this.isButton$.subscribe( e => console.log('isButton$', e ) );
    // this.empty$.subscribe( e => console.log('empty$', e ) );
    // this.description$.subscribe( e => console.log('description$', e ) );
    // this.DCardArray$.subscribe( e => console.log('pile::DCardArray$', e ) );
  }


  onClickedIfIsButton( isButton: boolean, topCard: DCard ) {
    if ( !isButton ) return;
    this.cardClicked.emit( topCard );
  }
}
