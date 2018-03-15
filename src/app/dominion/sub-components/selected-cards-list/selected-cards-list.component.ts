import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { MatDialog } from '@angular/material';

import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
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
export class SelectedCardsListComponent implements OnInit {
  cardPropertyList$ = this.database.cardPropertyList$;

  // settings
  @Input() showSelectedCardsCheckbox: boolean = false;

  // input data
  @Input() selectedCards$: Observable<SelectedCards>;
  @Input() selectedCardsCheckbox$: Observable<SelectedCardsCheckbox>;

  @Output() selectedCardsCheckboxPartEmitter
    = new EventEmitter<{ category: string, index: number, checked: boolean }>();


  selectedCardsCategories = [
    { name: 'KingdomCards10' , title: '王国カード' },
    { name: 'BaneCard'       , title: '災いカード（魔女娘用）' },
    { name: 'EventCards'     , title: 'EventCards' },
    { name: 'LandmarkCards'  , title: 'LandmarkCards' },
    { name: 'Obelisk'        , title: 'Obelisk 指定カード' },
    { name: 'BlackMarketPile', title: '闇市場デッキ' },
  ];


  constructor(
    public dialog: MatDialog,
    private database: FireDatabaseService,
  ) {
  }

  ngOnInit() {
  }


  selectedCardsCheckboxOnChange( category: string, index: number, value ) {
    this.selectedCardsCheckboxPartEmitter
      .emit({ category: category, index: index, checked: value });
  }

  cardInfoButtonClicked( cardIndex: number ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent, { autoFocus: false } );
    dialogRef.componentInstance.indiceInCardList$ = Observable.of([cardIndex]);
  }
}
