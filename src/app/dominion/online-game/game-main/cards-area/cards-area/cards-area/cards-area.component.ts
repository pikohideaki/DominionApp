import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { DCard } from '../../../../../../classes/game-state';
import { GameConfigService } from '../../../services/game-config.service';
import { CardPropertyDialogComponent } from '../../../../../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-cards-area',
  templateUrl: './cards-area.component.html',
  styleUrls: ['./cards-area.component.css']
})
export class CardsAreaComponent implements OnInit {

  @Input() displayStyle: 'lineUp'|'pile';
  @Input() showCardProperty: boolean = false;
  @Input() showArraySize: boolean = false;

  @Input() myIndex$: Observable<number>;
  @Input() DCardArray$: Observable<DCard[]>;
  @Input() cardWidth$: Observable<number>;

  @Output() cardClicked = new EventEmitter<DCard>();

  DCardArrayForView$: Observable<DCard[]>;

  // pile
  DCard$: Observable<DCard>;

  // lineUp
  @Input() defaultArrayLength: number = 1;
  @Input() padding: number;
  boxMinWidth$: Observable<number>;


  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    if ( this.displayStyle === 'lineUp' ) {
      this.DCardArrayForView$ = this.DCardArray$;
      this.showArraySize = false;
      this.boxMinWidth$
        = this.cardWidth$.map( width =>
            (width + this.padding) * this.defaultArrayLength );
    } else {
      this.DCardArrayForView$ = this.DCardArray$.map( ar => ar.slice( 0, 1 ) );
      this.boxMinWidth$ = this.cardWidth$;
    }

  }

  onClicked( dcard: DCard ) {
    this.cardClicked.emit( dcard );
  }



  openCardPropertyDialog( dcard: DCard ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    dialogRef.componentInstance.indiceInCardList$
      = Observable.of( [dcard.cardProperty.indexInList] );
  }
}
