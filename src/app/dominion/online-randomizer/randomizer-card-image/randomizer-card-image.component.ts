import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';

import { MatDialog } from '@angular/material';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyRandomizerGroupService       } from '../my-randomizer-group.service';

import { CardProperty  } from '../../../classes/card-property';
import { SelectedCards } from '../../../classes/selected-cards';

import { DominionCardImageComponent } from '../../sub-components/dominion-card-image/dominion-card-image.component';
import { CardPropertyDialogComponent } from '../../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-randomizer-card-image',
  templateUrl: './randomizer-card-image.component.html',
  styleUrls: ['./randomizer-card-image.component.css']
})
export class RandomizerCardImageComponent implements OnInit, OnDestroy {
  private alive = true;
  receiveDataDone: boolean = false;

  @Input() longSideLength = 180;
  cardPropertyList: CardProperty[] = [];
  selectedCards: SelectedCards = new SelectedCards();


  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    Observable.combineLatest(
        this.database.cardPropertyList$,
        this.myRandomizerGroup.selectedCards$,
        (cardPropertyList, selectedCards) => ({
          cardPropertyList : cardPropertyList,
          selectedCards    : selectedCards
        }) )
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardPropertyList = val.cardPropertyList;
        this.selectedCards    = val.selectedCards;
        this.receiveDataDone = true;
      });
  }


  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }


  cardInfoButtonClicked( cardIndex: number ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    dialogRef.componentInstance.card = this.cardPropertyList[cardIndex];
  }

}
