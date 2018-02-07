import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty } from '../../../../classes/card-property';
import { DCard } from '../../../../classes/game-state';
import { GameStateService } from '../game-state.service';
import { MyGameRoomService } from '../my-game-room.service';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-cards-lined-up',
  templateUrl: './cards-lined-up.component.html',
  styles: []
})
export class CardsLinedUpComponent implements OnInit {

  cardPropertyList$ = this.database.cardPropertyList$;
  myIndex$ = this.myGameRoomService.myIndex$;

  @Input() DCardArray$: Observable<DCard[]>;
  @Input() width: number;
  @Output() cardClicked = new EventEmitter<DCard>();


  constructor(
    private database: CloudFirestoreMediatorService,
    private myGameRoomService: MyGameRoomService
  ) {
  }

  ngOnInit() {
    // this.DCardArray$.subscribe( e => console.log('lined-up::DCardArray$', e ) );
  }

  onClicked( card: DCard ) {
    if ( card.isButton ) {
      this.cardClicked.emit( card );
    }
  }
}
