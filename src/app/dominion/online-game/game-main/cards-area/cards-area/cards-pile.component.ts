import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DCard } from '../../../../../classes/game-state';


@Component({
  selector: 'app-cards-pile',
  template: `
    <app-cards-area
      displayStyle="pile"
      [showArraySize]="showArraySize"
      [showCardProperty]="showCardProperty"
      [hideNonButtonCards]="hideNonButtonCards"
      [myIndex$]="myIndex$"
      [DCardArray$]="DCardArray$"
      [cardWidth$]="width$"
      [defaultArrayLength]="1"
      [padding]="0"
      (cardClicked)="onClicked( $event )" >
    </app-cards-area>
  `,
  styles: [],
})
export class CardsPileComponent implements OnInit {

  @Input() showArraySize:      boolean = true;
  @Input() showCardProperty:   boolean = false;
  @Input() hideNonButtonCards: boolean = false;

  @Input() myIndex$:    Observable<number>;
  @Input() DCardArray$: Observable<DCard[]>;
  @Input() width$:      Observable<number>;

  @Output() cardClicked = new EventEmitter<DCard>();


  constructor() {}

  ngOnInit() {}

  onClicked( topCard: DCard ) {
    this.cardClicked.emit( topCard );
  }
}
