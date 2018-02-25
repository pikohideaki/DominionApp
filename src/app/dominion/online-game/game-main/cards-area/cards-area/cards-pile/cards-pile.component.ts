import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DCard } from '../../../../../../classes/game-state';


@Component({
  selector: 'app-cards-pile',
  template: `
    <app-card-image-wrapper
      [showArraySize]="showArraySize"
      [showCardProperty]="showCardProperty"
      [width$]="width$"
      [myIndex$]="myIndex$"
      [indexInArray]="0"
      [DCardArray$]="DCardArray$"
      (cardClicked)="onClicked( $event )" >
    </app-card-image-wrapper>
  `,
  styles: [],
})
export class CardsPileComponent implements OnInit {

  @Input() showArraySize: boolean = true;
  @Input() showCardProperty: boolean = false;
  @Input() DCardArray$: Observable<DCard[]>;
  @Input() myIndex$: Observable<number>;
  @Input() width$: Observable<number>;

  @Output() cardClicked = new EventEmitter<DCard>();

  empty$: Observable<boolean>;


  constructor(
  ) {
  }


  ngOnInit() {
    this.empty$
      = this.DCardArray$
          .map( ar => !ar || ar.length === 0 )
          .distinctUntilChanged();
  }


  onClicked( topCard: DCard ) {
    this.cardClicked.emit( topCard );
  }
}
