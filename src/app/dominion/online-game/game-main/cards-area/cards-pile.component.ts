import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty } from '../../../../classes/card-property';
import { DCard } from '../../../../classes/game-state';
import { MyGameRoomService } from '../my-game-room.service';


@Component({
  selector: 'app-cards-pile',
  template: `
    <ng-container *ngIf="{
          isButton:    isButton$ | async,
          faceUp:      faceUp$   | async,
          empty:       empty$    | async,
          card:        card$     | async,
          description: description$ | async
        } as data">
      <app-dominion-card-image
        [faceUp]="data.faceUp"
        [width]="width"
        [isButton]="data.isButton"
        [description]="data.description"
        [card]="data.card"
        [empty]="data.empty"
        (cardClicked)="onClickedIfIsButton( data.isButton )" >
      </app-dominion-card-image>
    </ng-container>
  `,
  styles: [],
})
export class CardsPileComponent implements OnChanges, OnInit {

  @Input() DCardArray: DCard[] = [];
  @Input() width: number;
  @Output() cardClicked = new EventEmitter<DCard>();

  private DCardArraySource = new BehaviorSubject<DCard[]>([]);

  private cardPropertyList$ = this.database.cardPropertyList$;
  private myIndex$ = this.myGameRoomService.myIndex$;

  faceUp$:      Observable<boolean>;
  isButton$:    Observable<boolean>;
  empty$:       Observable<boolean>;
  description$: Observable<string>;
  card$:        Observable<CardProperty>;



  constructor(
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService
  ) {
  }


  isEmpty( DCards ) {
    return ( !DCards || DCards.length === 0 );
  }


  ngOnChanges( changes: SimpleChanges ) {
    if ( changes.DCardArray !== undefined ) {
      this.DCardArraySource.next( this.DCardArray );
    }
  }

  ngOnInit() {

    this.faceUp$ = Observable.combineLatest(
      this.DCardArraySource.asObservable(),
      this.myIndex$,
      (DCards, myIndex) => {
        if ( this.isEmpty( DCards ) ) return false;
        return DCards[0].faceUp[ myIndex ];
      });

    this.isButton$ = Observable.combineLatest(
      this.DCardArraySource.asObservable(),
      this.myIndex$,
      (DCards, myIndex) => {
        if ( this.isEmpty( DCards ) ) return false;
        return DCards[0].isButton[ myIndex ];
      });

    this.empty$ = this.DCardArraySource.asObservable()
      .map( DCards => this.isEmpty( DCards ) );

    this.description$ = Observable.combineLatest(
      this.DCardArraySource.asObservable(),
      this.myIndex$,
      (DCards, myIndex) => {
        if ( this.isEmpty( DCards ) ) return '';
        return DCards[0].id.toString();
      });

    this.card$ = Observable.combineLatest(
      this.DCardArraySource.asObservable(),
      this.cardPropertyList$,
      (DCards, cardPropertyList) => {
        if ( this.isEmpty( DCards ) ) return cardPropertyList[0];
        return cardPropertyList[ DCards[0].cardListIndex ];
      });
  }


  onClickedIfIsButton( isButton: boolean ) {
    if ( !isButton || this.isEmpty( this.DCardArray ) ) return;
    this.cardClicked.emit( this.DCardArray[0] );
  }
}
