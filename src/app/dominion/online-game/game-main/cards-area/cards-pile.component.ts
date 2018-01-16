import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

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
  selector: 'app-cards-pile',
  template: `
    <app-dominion-card-image
      [faceUp]="faceUp"
      [width]="width"
      [isButton]="isButton"
      [description]="description"
      [card]="card"
      [empty]="empty"
      [returnValueOnClicked]="returnValueOnClicked"
      (cardClicked)="onClicked( $event )" >
    </app-dominion-card-image>
  `,
  styles: [],
})
export class CardsPileComponent implements OnInit, OnDestroy, OnChanges {
  private alive: boolean = true;

  private dataIsReady = {
    ngOnInit:         new Subject(),
    cardPropertyList: new Subject(),
    commonCardData: {
      cardListIndex: new Subject(),
    },
    cardDataForMe: {
      faceUp: new Subject(),
      isButton: new Subject(),
    },
  };

  private receiveDataDone$: Observable<boolean>;

  private cardPropertyList: CardProperty[] = [];
  private commonCardData: CommonCardData = new CommonCardData();
  private cardDataForMe: CardDataForPlayer = new CardDataForPlayer();

  faceUp: boolean;
  isButton: boolean;
  empty: boolean;

  card: CardProperty;
  returnValueOnClicked = -1;

  @Input() private cardIdArray: number[] = [];
  @Input() width: number;
  @Input() description: string = '';
  @Output() private cardClicked = new EventEmitter<number>();


  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myGameStateService: MyGameStateService,
  ) {

    this.database.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardPropertyList = val;
        this.dataIsReady.cardPropertyList.complete();
      });

    this.myGameStateService.commonCardData$$.cardListIndex$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.commonCardData.cardListIndex = val;
        this.dataIsReady.commonCardData.cardListIndex.complete();
      });

    this.myGameStateService.cardDataForMe$$.faceUp$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardDataForMe.faceUp = val;
        this.dataIsReady.cardDataForMe.faceUp.complete();
        this.update();
      });

    this.myGameStateService.cardDataForMe$$.isButton$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardDataForMe.isButton = val;
        this.dataIsReady.cardDataForMe.isButton.complete();
        this.update();
      });
  }


  ngOnChanges( changes: SimpleChanges ) {
    if ( changes.cardIdArray !== undefined ) this.update();
  }

  ngOnInit() {
    this.dataIsReady.ngOnInit.complete();
  }

  ngOnDestroy() {
    this.alive = false;
  }


  async update() {
    // console.log('cards-pile::update', this.cardIdArray )
    await this.dataIsReady.ngOnInit.asObservable().toPromise();
    await this.dataIsReady.cardPropertyList.asObservable().toPromise();
    await this.dataIsReady.commonCardData.cardListIndex.asObservable().toPromise();
    await this.dataIsReady.cardDataForMe.faceUp.asObservable().toPromise();
    await this.dataIsReady.cardDataForMe.isButton.asObservable().toPromise();

    this.card = this.cardPropertyList[0];  // default
    this.faceUp = true;
    this.empty = false;

    // there is no cards
    if ( !this.cardIdArray || this.cardIdArray.length === 0 ) {
      this.faceUp = false;
      this.empty = true;
      return;
    }

    const topCardID = this.cardIdArray[0];
    this.returnValueOnClicked = topCardID;
    this.card = this.cardPropertyList[ this.commonCardData.cardListIndex[ topCardID ] ];
    this.faceUp = this.cardDataForMe.faceUp[ topCardID ];
    this.isButton = this.cardDataForMe.isButton[ topCardID ];
    this.description = topCardID.toString();
  }

  onClicked( value: number ) {
    if ( this.isButton ) {
      this.cardClicked.emit( value );
    }
  }
}
