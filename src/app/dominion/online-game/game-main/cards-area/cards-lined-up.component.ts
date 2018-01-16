import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { UtilitiesService } from '../../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyGameStateService } from '../my-game-state.service';

import { CardProperty } from '../../../../classes/card-property';
import {
    CommonCardData,
    CommonCardData$$,
    CardDataForPlayer,
    CardDataForPlayer$$,
  } from '../../../../classes/game-room';


@Component({
  selector: 'app-cards-lined-up',
  template: `
    <ng-container *ngIf="receiveDataDone$ | async">
      <app-dominion-card-image *ngFor="let cardID of cardIdArray"
        [card]="cardPropertyList[ commonCardData.cardListIndex[ cardID ] ]"
        [width]="width"
        [faceUp]="cardDataForMe.faceUp[ cardID ]"
        [isButton]="cardDataForMe.isButton[ cardID ]"
        [returnValueOnClicked]="cardID"
        [description]="cardID.toString()"
        (cardClicked)="onClicked( cardID, $event )" >
      </app-dominion-card-image>
    </ng-container>
  `,
  styles: []
})
export class CardsLinedUpComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  receiveDataDone$: Observable<boolean>;

  cardPropertyList: CardProperty[] = [];
  commonCardData: CommonCardData = new CommonCardData();
  cardDataForMe: CardDataForPlayer = new CardDataForPlayer();

  @Input() cardIdArray: number[] = [];
  @Input() width: number;
  @Output() private cardClicked = new EventEmitter<number>();


  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myGameStateService: MyGameStateService,
  ) {
    this.database.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( val => this.cardPropertyList = val );

    this.myGameStateService.commonCardData$$.cardListIndex$
      .takeWhile( () => this.alive )
      .subscribe( val => this.commonCardData.cardListIndex = val );

    this.myGameStateService.commonCardData$$.cardListIndex$
      .takeWhile( () => this.alive )
      .subscribe( val => this.commonCardData.cardListIndex = val );

    this.myGameStateService.cardDataForMe$$.faceUp$
      .takeWhile( () => this.alive )
      .subscribe( val => this.cardDataForMe.faceUp = val );

    this.myGameStateService.cardDataForMe$$.isButton$
      .takeWhile( () => this.alive )
      .subscribe( val => this.cardDataForMe.isButton = val );

  }

  ngOnInit() {

    this.receiveDataDone$ = Observable.combineLatest(
        this.database.cardPropertyList$,
        this.myGameStateService.commonCardData$$.cardListIndex$,
        this.myGameStateService.cardDataForMe$$.faceUp$,
        this.myGameStateService.cardDataForMe$$.isButton$,
        () => true )
      .first()
      .startWith( false );
  }

  ngOnDestroy() {
    this.alive = false;
  }


  onClicked( cardID: number, value: number ) {
    if ( this.cardDataForMe.isButton[cardID] ) {
      this.cardClicked.emit( value );
    }
  }
}
