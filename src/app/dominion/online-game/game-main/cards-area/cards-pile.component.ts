import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeWhile';

import { UtilitiesService } from '../../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty } from '../../../../classes/card-property';
import { GameStateService } from '../game-state.service';
import { DCard } from '../../../../classes/game-state';
import { MyGameRoomService } from '../my-game-room.service';


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
      (cardClicked)="onClicked()" >
    </app-dominion-card-image>
  `,
  styles: [],
})
export class CardsPileComponent implements OnChanges, OnInit, OnDestroy {
  private alive: boolean = true;

  private isReady = {
    inputValues:      new Subject(),
    myIndex:          new Subject(),
    cardPropertyList: new Subject(),
  };

  private cardPropertyList: CardProperty[] = [];
  private myIndex: number = 0;

  @Input() DCardArray: DCard[] = [];
  @Input() width: number;
  @Output() cardClicked = new EventEmitter<DCard>();

  faceUp:   boolean;
  isButton: boolean;
  empty:    boolean;

  card: CardProperty;
  description: string = '';


  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private gameStateService: GameStateService,
    private myGameRoomService: MyGameRoomService
  ) {
    this.myGameRoomService.myIndex$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.myIndex = val;
        this.isReady.myIndex.complete();
      });

    this.database.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardPropertyList = val;
        this.isReady.cardPropertyList.complete();
      });
  }


  ngOnChanges( changes: SimpleChanges ) {
    if ( changes.DCardArray !== undefined ) this.update();
  }

  ngOnInit() {
    this.isReady.inputValues.complete();
  }

  ngOnDestroy() {
    this.alive = false;
  }


  async update() {
    await this.isReady.inputValues.asObservable().toPromise();
    await this.isReady.cardPropertyList.asObservable().toPromise();

    // default values
    this.card = this.cardPropertyList[0];
    this.faceUp   = true;
    this.isButton = false;
    this.empty    = false;

    // there is no cards
    if ( !this.DCardArray || this.DCardArray.length === 0 ) {
      this.faceUp = false;
      this.empty  = true;
      return;
    }

    const topCard    = this.DCardArray[0];
    this.card        = this.cardPropertyList[ topCard.cardListIndex ];
    this.faceUp      = topCard.faceUp  [ this.myIndex ];
    this.isButton    = topCard.isButton[ this.myIndex ];
    this.description = topCard.id.toString();
  }

  onClicked() {
    if ( !this.isButton ) return;
    if ( !this.DCardArray || this.DCardArray.length === 0 ) return;
    this.cardClicked.emit( this.DCardArray[0] );
  }
}
