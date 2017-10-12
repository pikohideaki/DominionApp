import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Rx';

import { UtilitiesService } from '../my-own-library/utilities.service';
import { DataTableComponent } from '../my-own-library/data-table/data-table.component';

import { CloudFirestoreMediatorService } from '../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty } from '../classes/card-property';
import { CardPropertyDialogComponent } from './sub-components/card-property-dialog/card-property-dialog.component';



@Component({
  selector: 'app-card-property-list',
  template: `
    <div class="bodyWithPadding">
      <app-data-table
        [data]='cardPropertyListForView$ | async'
        [columnSettings]='columnSettings'
        [itemsPerPageOptions]='[ 25, 50, 100, 200 ]'
        [itemsPerPageDefault]='50'
        (onClick)='showDetail( $event.rowIndex )' >
      </app-data-table>
      <app-waiting-spinner [done]="receiveDataDone"></app-waiting-spinner>
    </div>
  `,
})
export class CardPropertyListComponent implements OnInit, OnDestroy {

  receiveDataDone = false;
  private alive: boolean = true;

  private cardPropertyList: CardProperty[] = [];
  cardPropertyListForView$: Observable<any[]>;

  columnSettings = [
    { align: 'c', button: false, manip: 'none'             , name: 'no'                 , headerTitle: 'No.' },
    { align: 'c', button: true , manip: 'incrementalSearch', name: 'name_jp'            , headerTitle: '名前' },
    { align: 'c', button: false, manip: 'incrementalSearch', name: 'name_eng'           , headerTitle: 'Name' },
    { align: 'c', button: false, manip: 'filterBySelecter' , name: 'expansionName'      , headerTitle: 'セット名' },
    { align: 'c', button: false, manip: 'filterBySelecter' , name: 'category'           , headerTitle: '分類' },
    // { align: 'c', button: false, manip: 'multiSelect'      , name: 'cardTypesStr'       , headerTitle: '種別' },
    { align: 'c', button: false, manip: 'filterBySelecter' , name: 'cardTypesStr'       , headerTitle: '種別' },
    { align: 'c', button: false, manip: 'none'             , name: 'costStr'            , headerTitle: 'コスト' },
    { align: 'c', button: false, manip: 'none'             , name: 'VP'                 , headerTitle: 'VP' },
    { align: 'c', button: false, manip: 'none'             , name: 'drawCard'           , headerTitle: '+card' },
    { align: 'c', button: false, manip: 'none'             , name: 'action'             , headerTitle: '+action' },
    { align: 'c', button: false, manip: 'none'             , name: 'buy'                , headerTitle: '+buy' },
    { align: 'c', button: false, manip: 'none'             , name: 'coin'               , headerTitle: '+coin' },
    { align: 'c', button: false, manip: 'none'             , name: 'VPtoken'            , headerTitle: '+VPtoken' },
    { align: 'c', button: false, manip: 'filterBySelecter' , name: 'implemented'        , headerTitle: 'ゲーム実装状況' },
    { align: 'c', button: false, manip: 'filterBySelecter' , name: 'randomizerCandidate', headerTitle: 'ランダマイザー対象' },
  ];




  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
  ) {
    this.cardPropertyListForView$
      = this.database.cardPropertyList$.map( list => list.map( e => e.transform() ) );

    this.database.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( list => {
        this.cardPropertyList = list;
        this.receiveDataDone = true;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  showDetail( dataIndex: number ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    dialogRef.componentInstance.card = this.cardPropertyList[dataIndex];
  }
}
