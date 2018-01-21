import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CardProperty } from '../../../classes/card-property';


@Component({
  selector: 'app-card-property-dialog',
  templateUrl: './card-property-dialog.component.html',
  styleUrls: [
    '../../../my-own-library/data-table/data-table.component.css',
    './card-property-dialog.component.css'
  ]
})
export class CardPropertyDialogComponent implements OnInit {

  card: CardProperty;  // input

  items = [
    { memberName: 'no'            , name: 'Card No.' },
    { memberName: 'name_jp'       , name: '和名' },
    { memberName: 'name_jp_yomi'  , name: '読み' },
    { memberName: 'name_eng'      , name: '英名' },
    { memberName: 'expansionName' , name: 'セット' },
    { memberName: 'cost_coin'     , name: 'コスト（コイン）' },
    { memberName: 'cost_potion'   , name: 'コスト（ポーション）' },
    { memberName: 'cost_debt'     , name: 'コスト（借金）' },
    { memberName: 'category'      , name: '種類' },
    { memberName: 'cardTypesStr'  , name: '属性' },
    { memberName: 'VP'            , name: 'VP' },
    { memberName: 'drawCard'      , name: '+Draw Cards' },
    { memberName: 'action'        , name: '+Action' },
    { memberName: 'buy'           , name: '+Buy' },
    { memberName: 'coin'          , name: '+Coin' },
    { memberName: 'VPtoken'       , name: '+VP-token' },
    { memberName: 'implemented'   , name: 'オンラインゲーム実装状況' },
  ];


  card$: Observable<CardProperty>;
  cardForView$: Observable<Object>;

  // option（Dialogを開いたまま次のカード情報を見る）
  cards: CardProperty[] = [];  // input
  indexSource = new BehaviorSubject<number>(0);
  index$ = this.indexSource.asObservable();


  constructor(
    public dialogRef: MatDialogRef<CardPropertyDialogComponent>,
  ) {
    this.card$ = this.index$.map( idx =>
          ( this.cards.length > 0 ? this.cards[ idx ] : this.card ) );
    this.cardForView$ = this.card$.map( e => e.transformAll() );
  }

  ngOnInit() {
  }


  cardListLinkPath( linkId: number ) {
    return `http://suka.s5.xrea.com/dom/list.cgi?mode=show&id=${linkId}`;
  }

  goToNextCard() {
    this.indexSource.next( this.indexSource.getValue() + 1 );
  }

  goToPreviousCard() {
    this.indexSource.next( this.indexSource.getValue() - 1 );
  }

  /**
   * innerHeight, innerWidth : app window size
   * outerHeight, outerWidth : browser window size
   */
}

