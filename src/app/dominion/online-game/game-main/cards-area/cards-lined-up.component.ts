import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty } from '../../../../classes/card-property';
import { DCard } from '../../../../classes/game-state';
import { GameStateService } from '../game-state.service';
import { MyGameRoomService } from '../my-game-room.service';


@Component({
  selector: 'app-cards-lined-up',
  template: `
    <ng-container *ngIf="{
          cardPropertyList: cardPropertyList$ | async,
          myIndex: myIndex$ | async
        } as data">
      <ng-container *ngIf="data?.cardPropertyList?.length > 0">
        <ng-container
            *ngIf="!DCardArray || DCardArray.length === 0
                    then emptyCard; else Card">
        </ng-container>
        <ng-template #emptyCard>
          <app-dominion-card-image
            [card]="data.cardPropertyList[0]"
            [width]="width"
            [empty]="true"
            (cardClicked)="onClicked()" >
          </app-dominion-card-image>
        </ng-template>
        <ng-template #Card>
          <app-dominion-card-image *ngFor="let DCard of DCardArray"
            [card]="data.cardPropertyList[ DCard.cardListIndex ]"
            [width]="width"
            [faceUp]="DCard.faceUp[ data.myIndex ]"
            [isButton]="DCard.isButton[ data.myIndex ]"
            [description]="DCard.id.toString()"
            (cardClicked)="onClicked( DCard )" >
          </app-dominion-card-image>
        </ng-template>
      </ng-container>
    </ng-container>
  `,
  styles: []
})
export class CardsLinedUpComponent implements OnInit {

  cardPropertyList$ = this.database.cardPropertyList$;
  myIndex$ = this.myGameRoomService.myIndex$;

  @Input() DCardArray: DCard[] = [];
  @Input() width: number;
  @Output() cardClicked = new EventEmitter<DCard>();


  constructor(
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService
  ) {
  }

  ngOnInit() {
  }

  onClicked( card: DCard ) {
    if ( card.isButton ) {
      this.cardClicked.emit( card );
    }
  }
}
