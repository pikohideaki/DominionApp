import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import 'rxjs/add/operator/takeWhile';

import { MatDialog, MatSnackBar } from '@angular/material';

import { GameResult    } from '../../../../classes/game-result';
import { SelectedCards } from '../../../../classes/selected-cards';
import { CardProperty  } from '../../../../classes/card-property';

import { CloudFirestoreMediatorService } from '../../../../firebase-mediator/cloud-firestore-mediator.service';
import { ConfirmDialogComponent } from '../../../../my-own-library/confirm-dialog.component';

import { CardPropertyDialogComponent } from '../../../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-game-result-detail-dialog',
  templateUrl: './game-result-detail-dialog.component.html',
  styleUrls: [
    '../../../../my-own-library/data-table/data-table.component.css',
    './game-result-detail-dialog.component.css'
  ]
})
export class GameResultDetailDialogComponent implements OnInit, OnDestroy {
  private alive = true;

  cardPropertyList: CardProperty[] = [];

  @Input() gameResult: GameResult = new GameResult();
  @Input() selectedCards: SelectedCards = new SelectedCards();

  // firebasePath = 'https://console.firebase.google.com/u/0/project/dominionapps/database/data/data/gameResultList/';
  firebasePath = 'https://console.firebase.google.com/u/0/project/dominionapps/database/dominionapps/data/data/gameResultList/';


  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private database: CloudFirestoreMediatorService
  ) {
  }

  ngOnInit() {
    this.firebasePath += this.gameResult.databaseKey;

    const toIndex = ( cardId => this.cardPropertyList.findIndex( e => e.cardId === cardId ) );

    this.database.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardPropertyList = val;

        this.selectedCards.Prosperity      = this.gameResult.selectedCardsId.Prosperity;
        this.selectedCards.DarkAges        = this.gameResult.selectedCardsId.DarkAges;
        this.selectedCards.KingdomCards10  = (this.gameResult.selectedCardsId.KingdomCards10  || []).map( toIndex );
        this.selectedCards.BaneCard        = (this.gameResult.selectedCardsId.BaneCard        || []).map( toIndex );
        this.selectedCards.EventCards      = (this.gameResult.selectedCardsId.EventCards      || []).map( toIndex );
        this.selectedCards.Obelisk         = (this.gameResult.selectedCardsId.Obelisk         || []).map( toIndex );
        this.selectedCards.LandmarkCards   = (this.gameResult.selectedCardsId.LandmarkCards   || []).map( toIndex );
        this.selectedCards.BlackMarketPile = (this.gameResult.selectedCardsId.BlackMarketPile || []).map( toIndex );
      });

  }

  ngOnDestroy() {
    this.alive = false;
  }


  cardInfoButtonClicked( cardIndex: number ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    dialogRef.componentInstance.card = this.cardPropertyList[cardIndex];
  }

  edit() {

  }

  deleteGameResult() {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message = 'ゲーム記録を削除してもよろしいですか？';
    dialogRef.afterClosed().subscribe( answer => {
      if ( answer === 'yes' ) {
        this.database.gameResult.remove( this.gameResult.databaseKey );
        this.openSnackBar();
      }
    });
  }

  private openSnackBar() {
    this.snackBar.open( 'Deleted.', undefined, { duration: 3000 } );
  }

}
