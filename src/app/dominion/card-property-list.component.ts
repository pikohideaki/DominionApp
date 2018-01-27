import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { UtilitiesService } from '../my-own-library/utilities.service';
import { ColumnSetting } from '../my-own-library/data-table/data-table.component';

import { CloudFirestoreMediatorService } from '../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty, transform } from '../classes/card-property';
import { CardPropertyDialogComponent } from './sub-components/card-property-dialog/card-property-dialog.component';



@Component({
  selector: 'app-card-property-list',
  template: `
    <div class="body-with-padding">
      <app-data-table
        [data$]='cardPropertyList$'
        [transform]="transformFunction"
        [columnSettings]='columnSettings'
        [itemsPerPageOptions]='[ 25, 50, 100, 200 ]'
        [itemsPerPageInit]='50'
        (onClick)='showDetail( $event )'
        (filteredIndiceOnChange)="filteredIndiceOnChange( $event )">
      </app-data-table>
    </div>
  `,
})
export class CardPropertyListComponent implements OnInit {

  cardPropertyList$ = this.database.cardPropertyList$;
  private filteredIndiceSource = new BehaviorSubject<number[]>([]);


  columnSettings: ColumnSetting[] = [
    { isButton: false, manip: ''               , name: 'no'                 , headerTitle: 'No.' },
    { isButton: true,  manip: 'input'          , name: 'nameJp'             , headerTitle: '名前' },
    { isButton: false, manip: 'input'          , name: 'nameEng'            , headerTitle: 'Name' },
    { isButton: false, manip: 'multiSelect-or' , name: 'expansionName'      , headerTitle: 'セット名' },
    { isButton: false, manip: 'select'         , name: 'category'           , headerTitle: '分類' },
    { isButton: false, manip: 'multiSelect-and', name: 'cardTypes'          , headerTitle: '種別' },
    { isButton: false, manip: ''               , name: 'cost'               , headerTitle: 'コスト' },
    { isButton: false, manip: ''               , name: 'VP'                 , headerTitle: 'VP' },
    { isButton: false, manip: ''               , name: 'drawCard'           , headerTitle: '+card' },
    { isButton: false, manip: ''               , name: 'action'             , headerTitle: '+action' },
    { isButton: false, manip: ''               , name: 'buy'                , headerTitle: '+buy' },
    { isButton: false, manip: ''               , name: 'coin'               , headerTitle: '+coin' },
    { isButton: false, manip: ''               , name: 'VPtoken'            , headerTitle: '+VPtoken' },
    { isButton: false, manip: 'select'         , name: 'implemented'        , headerTitle: 'ゲーム実装状況' },
    { isButton: false, manip: 'select'         , name: 'randomizerCandidate', headerTitle: 'ランダマイザー対象' },
  ];




  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
  ) {
  }

  ngOnInit() {
  }

  transformFunction( property: string, value ) {
    return transform( property, value );
  }

  showDetail( position ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent, { autoFocus: false } );
    dialogRef.componentInstance.indiceInCardList$
      = Observable.from([ this.filteredIndiceSource.getValue() ]);
    dialogRef.componentInstance.showingIndexInit = position.rowIndexOnFiltered;
  }

  filteredIndiceOnChange( indice: number[] ) {
    this.filteredIndiceSource.next( indice );
  }
}
