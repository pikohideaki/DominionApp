import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { MatDialog } from '@angular/material';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { CardPropertyDialogComponent } from '../card-property-dialog/card-property-dialog.component';

import { CardProperty          } from '../../../classes/card-property';
import { SelectedCards         } from '../../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../../classes/black-market-pile-card';


@Component({
  selector: 'app-selected-cards-list',
  templateUrl: './selected-cards-list.component.html',
  styleUrls: [
    '../../../my-own-library/data-table/data-table.component.css',
    './selected-cards-list.component.css'
  ]
})
export class SelectedCardsListComponent implements OnInit, OnDestroy {
  private alive = true;
  receiveDataDone: boolean = false;

  cardPropertyList: CardProperty[] = [];

  // settings
  @Input() showSelectedCardsCheckbox: boolean = false;

  // input data
  @Input() selectedCards: SelectedCards;
  @Input() selectedCardsCheckbox: SelectedCardsCheckbox = new SelectedCardsCheckbox();

  @Output() selectedCardsCheckboxPartEmitter
    = new EventEmitter<{ category: string, index: number, checked: boolean }>();


  selectedCardsCategories = [
    { id: 'KingdomCards10' , title: '王国カード' },
    { id: 'BaneCard'       , title: '災いカード（魔女娘用）' },
    { id: 'EventCards'     , title: 'EventCards' },
    { id: 'LandmarkCards'  , title: 'LandmarkCards' },
    { id: 'Obelisk'        , title: 'Obelisk 指定カード' },
    { id: 'BlackMarketPile', title: '闇市場デッキ' },
  ];


  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
  ) {
    this.database.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardPropertyList = val;
        this.receiveDataDone = true;
      } );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }


  selectedCardsCheckboxOnChange( category: string, index: number, value ) {
    this.selectedCardsCheckbox[category][index] = value;
    this.selectedCardsCheckboxPartEmitter
      .emit({ category: category, index: index, checked: value });
  }

  cardInfoButtonClicked( cardIndex: number ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent, { autoFocus: false } );
    dialogRef.componentInstance.card = this.cardPropertyList[cardIndex];
  }

}
