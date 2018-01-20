import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';

import { ConfirmDialogComponent } from '../../../my-own-library/confirm-dialog.component';

import { UtilitiesService       } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyRandomizerGroupService } from '../my-randomizer-group.service';

import { DominionCardImageComponent } from '../../sub-components/dominion-card-image/dominion-card-image.component';
import { CardPropertyDialogComponent } from '../../sub-components/card-property-dialog/card-property-dialog.component';

import { CardProperty        } from '../../../classes/card-property';
import { BlackMarketPileCard } from '../../../classes/black-market-pile-card';
import { BlackMarketPhase    } from '../../../classes/black-market-phase.enum';


@Component({
  selector: 'app-black-market-pile',
  templateUrl: './black-market-pile.component.html',
  styleUrls: ['./black-market-pile.component.css']
})
export class BlackMarketPileComponent implements OnInit, OnDestroy {
  private alive = true;
  receiveDataDone = false;

  BMPhase = BlackMarketPhase;

  faceUp = false;
  @Input() longSideLength = 180;

  cardPropertyList: CardProperty[];

  BlackMarketPileShuffled: BlackMarketPileCard[] = [];
  currentPhase = BlackMarketPhase.init;

  private promiseResolver = {};



  constructor(
    public dialog: MatDialog,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService
  ) {
    this.myRandomizerGroup.BlackMarketPhase$
      .takeWhile( () => this.alive )
      .subscribe( val => this.currentPhase = val );

    Observable.combineLatest(
        this.database.cardPropertyList$,
        this.myRandomizerGroup.BlackMarketPileShuffled$,
        ( cardPropertyList, BlackMarketPileShuffled ) => ({
          cardPropertyList        : cardPropertyList,
          BlackMarketPileShuffled : BlackMarketPileShuffled
        }) )
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardPropertyList = val.cardPropertyList;
        this.BlackMarketPileShuffled = val.BlackMarketPileShuffled;
        this.receiveDataDone = true;
      } );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }



  /* 闇市場のデッキの上から3枚のカードを公開する。あなたは公開したカードのうち1枚を即座に購入してもよい。購入しなかったカードは、好きな順番で闇市場のデッキの下に置く。
   * 「騎士」を使用する場合は、ランダマイザーカードではなく、「騎士」10枚のうちどれか1枚を入れる。
   * ※「闇市場」の効果による購入でカード1枚を獲得したときに、リアクションとして「交易人」を手札から公開した場合、そのカード1枚は獲得されず、闇市場デッキの一番上に戻す。
   */

  onClick( operation: string, value: number ) {
    switch ( operation ) {  // check operation string
      case 'buy' :
      case 'putOnTheBottom' :
        this.promiseResolver[operation]( value );
        break;
      default :
        console.error( `'promiseResolver' does not have operation '${operation}'.` );
        break;
    }

  }

  putOnTheBottomDone(): boolean {
    const numberOfFaceDownCards = this.BlackMarketPileShuffled.filter( e => !e.faceUp ).length;
    const firstIndexOfFaceUpCard = this.BlackMarketPileShuffled.findIndex( e => e.faceUp );
    return numberOfFaceDownCards === firstIndexOfFaceUpCard;
  }

  async revealTop3Cards() {
    // 上から3枚をめくる
    this.myRandomizerGroup.setBlackMarketPhase( this.BMPhase.init );


    this.BlackMarketPileShuffled.forEach( (e, i) => e.faceUp = (i < 3) );
    this.myRandomizerGroup.setBlackMarketPileShuffled( this.BlackMarketPileShuffled );


    // 3枚のうち1枚を購入するか，1枚も購入しない
    this.myRandomizerGroup.setBlackMarketPhase( this.BMPhase.buy );

    while (true) {
      const clickedElementValue
        = await new Promise<number>( resolve => this.promiseResolver['buy'] = resolve );

      if ( clickedElementValue === -1 ) break;  // don't buy

      if ( 0 <= clickedElementValue && clickedElementValue < 3 ) {  // buy a card
        const cardIndex = this.BlackMarketPileShuffled[ clickedElementValue ].cardIndex;
        const dialogRef = this.dialog.open( ConfirmDialogComponent );
        dialogRef.componentInstance.message = `「${this.cardPropertyList[cardIndex].name_jp}」を購入しますか？`;
        const yn = await dialogRef.afterClosed().toPromise();
        if ( yn === 'yes' ) {
          this.utils.removeAt( this.BlackMarketPileShuffled, clickedElementValue );
          this.myRandomizerGroup.setBlackMarketPileShuffled( this.BlackMarketPileShuffled );
          break;
        }
      }
    }

    // 残りは好きな順に闇市場デッキの下に置く
    this.myRandomizerGroup.setBlackMarketPhase( this.BMPhase.putOnTheBottom );

    while (true) {
      const clickedElementValue2
        = await new Promise<number>( resolve => this.promiseResolver['putOnTheBottom'] = resolve );
      if ( clickedElementValue2 === -1 ) break;

      const selectedElement = this.utils.removeAt( this.BlackMarketPileShuffled, clickedElementValue2 );
      this.BlackMarketPileShuffled.push( selectedElement );
      this.myRandomizerGroup.setBlackMarketPileShuffled( this.BlackMarketPileShuffled );
    }

    // 確認
    this.BlackMarketPileShuffled.forEach( e => e.faceUp = false );  // reset
    this.myRandomizerGroup.setBlackMarketPileShuffled( this.BlackMarketPileShuffled );

    this.myRandomizerGroup.setBlackMarketPhase( this.BMPhase.init );
  }

}
