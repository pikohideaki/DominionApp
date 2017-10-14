import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MatDialog } from '@angular/material';

import { DataTableComponent                 } from '../../../my-own-library/data-table/data-table.component';
import { ItemsPerPageComponent              } from '../../../my-own-library/data-table/items-per-page.component';
import { PagenationComponent, getDataAtPage } from '../../../my-own-library/data-table/pagenation/pagenation.component';

import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { SetMemoDialogComponent } from '../../sub-components/set-memo-dialog.component';
import { GameResultDetailDialogComponent    } from './game-result-detail-dialog/game-result-detail-dialog.component';

import { GameResult } from '../../../classes/game-result';


@Component({
  selector: 'app-game-result-list',
  templateUrl: './game-result-list.component.html',
  styleUrls: [ '../../../my-own-library/data-table/data-table.component.css' ]
})
export class GameResultListComponent implements OnInit {
  receiveDataDone = false;

  @Input() gameResultListFiltered$: Observable<GameResult[]>;
  private gameResultListFiltered: GameResult[] = [];

  // pagenation
  private selectedPageIndexSource = new BehaviorSubject<number>(0);
  selectedPageIndex$ = this.selectedPageIndexSource.asObservable();

  private itemsPerPageSource = new BehaviorSubject<number>(50);
  itemsPerPage$ = this.itemsPerPageSource.asObservable();

  currentPageData$: Observable<GameResult[]>;


  constructor(
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService
  ) {}

  ngOnInit() {
    this.gameResultListFiltered$.subscribe( gameResultListFiltered => {
      this.receiveDataDone = true;
      this.changeSelectedPageIndex(0);
      this.gameResultListFiltered = gameResultListFiltered;
    });

    this.currentPageData$
      = this.gameResultListFiltered$.combineLatest(
          this.itemsPerPage$,
          this.selectedPageIndex$,
          ( gameResultListFiltered, itemsPerPage, selectedPageIndex ) =>
              getDataAtPage(
                  Array.from( gameResultListFiltered ).reverse(),
                  itemsPerPage,
                  selectedPageIndex ) );
  }


  changeSelectedPageIndex( selectedPageIndex: number ) {
    this.selectedPageIndexSource.next(selectedPageIndex);
  }
  changeItemsPerPage( itemsPerPage: number ) {
    this.itemsPerPageSource.next(itemsPerPage);
    this.changeSelectedPageIndex(0);
  }



  getDetail( no: number ) {
    const gameResult = this.gameResultListFiltered.find( e => e.no === no );
    const databaseKey = gameResult.databaseKey;
    const dialogRef = this.dialog.open( GameResultDetailDialogComponent );
    dialogRef.componentInstance.gameResult = gameResult;
  }

  memoClicked( no: number ) {
    const gameResult = this.gameResultListFiltered.find( e => e.no === no );
    const dialogRef = this.dialog.open( SetMemoDialogComponent );
    dialogRef.componentInstance.memo = gameResult.memo;
    dialogRef.afterClosed().subscribe( result => {
      if ( result === undefined ) return;
      this.database.gameResult.setMemo( gameResult.databaseKey, result );
    });
  }

}
