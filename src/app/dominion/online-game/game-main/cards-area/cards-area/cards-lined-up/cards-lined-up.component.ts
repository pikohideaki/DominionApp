import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


import { CardProperty } from '../../../../../../classes/card-property';
import { DCard } from '../../../../../../classes/game-state';

import { CardPropertyDialogComponent } from '../../../../../sub-components/card-property-dialog/card-property-dialog.component';

import { CloudFirestoreMediatorService } from '../../../../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameStateService  } from '../../../services/game-state-services/game-state.service';
import { MyGameRoomService } from '../../../services/my-game-room.service';
import { GameConfigService } from '../../../services/game-config.service';


@Component({
  selector: 'app-cards-lined-up',
  templateUrl: './cards-lined-up.component.html',
  styleUrls: ['../cards-area.css', './cards-lined-up.component.css'],

})
export class CardsLinedUpComponent implements OnInit, OnChanges {

  myIndex$ = this.myGameRoomService.myIndex$;

  // @Input() overlayDisplay: boolean = false;
  // @Input() maxLineWidth: number;

  @Input() defaultArrayLength: number = 1;  // min-width

  @Input() showCardProperty: boolean = false;
  @Input() DCardArray$: Observable<DCard[]>;
  @Input() width: number;
  @Output() cardClicked = new EventEmitter<DCard>();

  private widthDefaultSource = new BehaviorSubject<number>(40);

    // 10枚毎にカードサイズを0.8倍に
  widthModified$: Observable<number>;


  constructor(
    private dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService,
    private config: GameConfigService
  ) {
  }

  ngOnChanges( changes: SimpleChanges ) {
    if ( changes.width !== undefined ) {
      this.widthDefaultSource.next( changes.width.currentValue || 40 );
    }
  }

  ngOnInit() {
    // this.DCardArray$.subscribe( e => console.log('lined-up::DCardArray$', e ) );
    this.widthDefaultSource.next( this.width );  // init

    // 10枚毎にカードサイズを0.8倍に
    this.widthModified$
      = Observable.combineLatest(
            this.widthDefaultSource.asObservable().debounceTime(500),
            this.DCardArray$.map( e => e.length ).distinctUntilChanged(),
            this.config.cardSizeAutoChange$,
            (width, size, autoChange) => width * ( 1.0 - ( autoChange ? size / 100 : 0 ) ) )
          .debounceTime(100);
  }

  onClicked( card: DCard ) {
    if ( card.isButton ) {
      this.cardClicked.emit( card );
    }
  }


  openCardPropertyDialog( dcard: DCard ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    dialogRef.componentInstance.indiceInCardList$ = Observable.of( [dcard.cardProperty.indexInList] );
  }
}
