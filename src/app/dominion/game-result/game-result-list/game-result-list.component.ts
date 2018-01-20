import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Observable      } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/combineLatest';

import { MatDialog } from '@angular/material';

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
export class GameResultListComponent implements OnInit, OnDestroy {
  private alive = true;
  receiveDataDone = false;

  @Input() private gameResultListFiltered$: Observable<GameResult[]>;
  gameResultListFiltered: GameResult[] = [];

  // pagenation
  private selectedPageIndexSource = new BehaviorSubject<number>(0);
  private selectedPageIndex$ = this.selectedPageIndexSource.asObservable();
  selectedPageIndex: number;

  private itemsPerPageSource = new BehaviorSubject<number>(50);
  private itemsPerPage$ = this.itemsPerPageSource.asObservable();
  itemsPerPage: number;

  currentPageData: GameResult[] = [];


  constructor(
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService
  ) {
    this.itemsPerPage$
      .takeWhile( () => this.alive )
      .subscribe( val => this.itemsPerPage = val );
    this.selectedPageIndex$
      .takeWhile( () => this.alive )
      .subscribe( val => this.selectedPageIndex = val );
  }

  ngOnInit() {
    this.gameResultListFiltered$.subscribe( gameResultListFiltered => {
      this.receiveDataDone = true;
      this.changeSelectedPageIndex(0);
      this.gameResultListFiltered = gameResultListFiltered;
    });

    const currentPageData$: Observable<GameResult[]>
      = this.gameResultListFiltered$.combineLatest(
          this.itemsPerPage$,
          this.selectedPageIndex$,
          ( gameResultListFiltered, itemsPerPage, selectedPageIndex ) =>
              getDataAtPage(
                  Array.from( gameResultListFiltered ).reverse(),
                  itemsPerPage,
                  selectedPageIndex ) );

    currentPageData$
      .takeWhile( () => this.alive )
      .subscribe( val => this.currentPageData = val );
  }

  ngOnDestroy() {
    this.alive = false;
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
