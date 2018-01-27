import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CardProperty } from '../../../classes/card-property';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';


@Component({
  selector: 'app-card-property-dialog',
  templateUrl: './card-property-dialog.component.html',
  styleUrls: [
    '../../../my-own-library/data-table/data-table.component.css',
    './card-property-dialog.component.css'
  ]
})
export class CardPropertyDialogComponent implements OnInit {

  indiceInCardList$: Observable<number[]>;  // input

  // option（Dialogを開いたまま次のカード情報を見る）
  showingIndexInit: number = 0;  // input (option)
  private showingIndexSource = new BehaviorSubject<number>(0);
  showingIndex$ = this.showingIndexSource.asObservable();


  private cardPropertyList$ = this.database.cardPropertyList$;

  card$: Observable<CardProperty>;
  cardForView$: Observable<Object>;

  items = [
    { memberName: 'no'           , name: 'Card No.' },
    { memberName: 'nameJp'       , name: '和名' },
    { memberName: 'nameJpYomi'   , name: '読み' },
    { memberName: 'nameEng'      , name: '英名' },
    { memberName: 'expansionName', name: 'セット' },
    { memberName: 'cost_coin'    , name: 'コスト（コイン）' },
    { memberName: 'cost_potion'  , name: 'コスト（ポーション）' },
    { memberName: 'cost_debt'    , name: 'コスト（借金）' },
    { memberName: 'category'     , name: '種類' },
    { memberName: 'cardTypesStr' , name: '属性' },
    { memberName: 'VP'           , name: 'VP' },
    { memberName: 'drawCard'     , name: '+Draw Cards' },
    { memberName: 'action'       , name: '+Action' },
    { memberName: 'buy'          , name: '+Buy' },
    { memberName: 'coin'         , name: '+Coin' },
    { memberName: 'VPtoken'      , name: '+VP-token' },
    { memberName: 'implemented'  , name: 'オンラインゲーム実装状況' },
  ];


  constructor(
    public dialogRef: MatDialogRef<CardPropertyDialogComponent>,
    private database: CloudFirestoreMediatorService,
    private utils: UtilitiesService
  ) {
  }

  ngOnInit() {
    this.showingIndexSource.next( this.showingIndexInit );

    this.card$ = Observable.combineLatest(
        this.showingIndex$,
        this.indiceInCardList$,
        this.cardPropertyList$,
        (showingIndex, indiceInCardList, cardPropertyList) =>
          ( indiceInCardList.length === 0 ||
            !this.utils.isInArrayRange( showingIndex, indiceInCardList )
              ? new CardProperty()
              : cardPropertyList[ indiceInCardList[ showingIndex ] ] ) );

    this.cardForView$ = this.card$.map( e => e.transformAll() );
  }


  cardListLinkPath( linkId: number ) {
    return `http://suka.s5.xrea.com/dom/list.cgi?mode=show&id=${linkId}`;
  }

  goToNextCard() {
    this.showingIndexSource.next( this.showingIndexSource.getValue() + 1 );
  }

  goToPreviousCard() {
    this.showingIndexSource.next( this.showingIndexSource.getValue() - 1 );
  }

  /**
   * innerHeight, innerWidth : app window size
   * outerHeight, outerWidth : browser window size
   */
}
