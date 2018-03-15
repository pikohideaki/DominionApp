import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MatDialog } from '@angular/material';

import { getDataAtPage } from '../../../my-own-library/data-table/pagenation/pagenation.component';
import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { SetMemoDialogComponent } from '../../sub-components/set-memo-dialog.component';
import { GameResultDetailDialogComponent    } from './game-result-detail-dialog/game-result-detail-dialog.component';
import { GameResult } from '../../../classes/game-result';


@Component({
  selector: 'app-game-result-list',
  templateUrl: './game-result-list.component.html',
  styleUrls: [ '../../../my-own-library/data-table/data-table.component.css' ]
})
export class GameResultListComponent implements OnInit, OnDestroy {
  private alive = true;

  @Input() private gameResultListFiltered$: Observable<GameResult[]>;
  filteredDataLength$: Observable<number>;

  // pagenation
  private selectedPageIndexSource = new BehaviorSubject<number>(0);
  selectedPageIndex$ = this.selectedPageIndexSource.asObservable();

  private itemsPerPageSource = new BehaviorSubject<number>(50);
  itemsPerPage$ = this.itemsPerPageSource.asObservable();

  currentPageData$: Observable<GameResult[]>;


  constructor(
    public dialog: MatDialog,
    private database: FireDatabaseService
  ) {
  }

  ngOnInit() {
    this.currentPageData$
      = this.gameResultListFiltered$.combineLatest(
          this.itemsPerPage$,
          this.selectedPageIndex$,
          (gameResultListFiltered, itemsPerPage, selectedPageIndex) =>
              getDataAtPage(
                  Array.from( gameResultListFiltered ).reverse(),
                  itemsPerPage,
                  selectedPageIndex ) );

    this.filteredDataLength$ = this.gameResultListFiltered$.map( e => e.length );

    this.gameResultListFiltered$
      .takeWhile( () => this.alive )
      .subscribe( _ => this.changeSelectedPageIndex(0) );
  }

  ngOnDestroy() {
    this.alive = false;
  }


  changeSelectedPageIndex( selectedPageIndex: number ) {
    this.selectedPageIndexSource.next( selectedPageIndex );
  }
  changeItemsPerPage( itemsPerPage: number ) {
    this.itemsPerPageSource.next( itemsPerPage );
    this.changeSelectedPageIndex(0);
  }



  getDetail( gameResult: GameResult ) {
    const databaseKey = gameResult.databaseKey;
    const dialogRef = this.dialog.open( GameResultDetailDialogComponent, { autoFocus: false } );
    dialogRef.componentInstance.gameResult = gameResult;
  }

  memoClicked( gameResult: GameResult ) {
    const dialogRef = this.dialog.open( SetMemoDialogComponent );
    dialogRef.componentInstance.memo = gameResult.memo;
    dialogRef.afterClosed().subscribe( result => {
      if ( result === undefined ) return;
      this.database.gameResult.setMemo( gameResult.databaseKey, result );
    });
  }
}
