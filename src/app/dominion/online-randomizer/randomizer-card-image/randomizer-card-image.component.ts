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

  @Input() longSideLength = 180;
  selectedCards$: Observable<SelectedCards>;
  cardPropertyList$: Observable<CardProperty[]>;

  private cardPropertyList: CardProperty[] = [];


  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    this.selectedCards$ = this.myRandomizerGroup.selectedCards$;
    this.cardPropertyList$ = this.database.cardPropertyList$;
    this.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( val => this.cardPropertyList = val );
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
