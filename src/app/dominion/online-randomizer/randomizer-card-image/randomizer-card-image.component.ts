import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { MatDialog } from '@angular/material';

import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyRandomizerGroupService       } from '../my-randomizer-group.service';

import { CardProperty  } from '../../../classes/card-property';
import { SelectedCards } from '../../../classes/selected-cards';

import { CardPropertyDialogComponent } from '../../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-randomizer-card-image',
  templateUrl: './randomizer-card-image.component.html',
  styleUrls: ['./randomizer-card-image.component.css']
})
export class RandomizerCardImageComponent implements OnInit {

  @Input() longSideLength = 180;
  selectedCards$ = this.myRandomizerGroup.selectedCards$;
  cardPropertyList$ = this.database.cardPropertyList$;


  constructor(
    public dialog: MatDialog,
    private database: FireDatabaseService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
  }

  ngOnInit() {
  }

  cardInfoButtonClicked( cardIndex: number ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent, { autoFocus: false } );
    dialogRef.componentInstance.indiceInCardList$ = Observable.of([cardIndex]);
  }
}
