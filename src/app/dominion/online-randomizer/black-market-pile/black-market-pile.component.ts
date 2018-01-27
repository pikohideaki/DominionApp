import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Observable } from 'rxjs/Observable';

import { ConfirmDialogComponent } from '../../../my-own-library/confirm-dialog.component';

import { UtilitiesService       } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyRandomizerGroupService } from '../my-randomizer-group.service';

import { CardProperty        } from '../../../classes/card-property';
import { BlackMarketPileCard } from '../../../classes/black-market-pile-card';
import { BlackMarketPhase as BMPhase, BlackMarketPhase } from '../../../classes/black-market-phase.enum';


@Component({
  selector: 'app-black-market-pile',
  templateUrl: './black-market-pile.component.html',
  styleUrls: ['./black-market-pile.component.css']
})
export class BlackMarketPileComponent implements OnInit {

  PHASE = BMPhase;  // used in the template

  private faceUp = false;
  @Input() longSideLength = 180;

  cardPropertyList$ = this.database.cardPropertyList$;

  BlackMarketPileShuffled$: Observable<BlackMarketPileCard[]>
    = this.myRandomizerGroup.BlackMarketPileShuffled$;

  currentPhase$: Observable<BlackMarketPhase>
    = this.myRandomizerGroup.BlackMarketPhase$.startWith( BMPhase.init );

  putOnTheBottomDone$: Observable<boolean>
    = this.BlackMarketPileShuffled$.map(
        pile => {
          const numberOfFaceDownCards = pile.filter( e => !e.faceUp ).length;
          const firstIndexOfFaceUpCard = pile.findIndex( e => e.faceUp );
          return numberOfFaceDownCards === firstIndexOfFaceUpCard;
        });


  private promiseResolver = {};


  constructor(
    public dialog: MatDialog,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService
  ) {
  }

  ngOnInit() {
  }


  /* 闇市場のデッキの上から3枚のカードを公開する。あなたは公開したカードのうち1枚を即座に購入してもよい。購入しなかったカードは、好きな順番で闇市場のデッキの下に置く。
   * 「騎士」を使用する場合は、ランダマイザーカードではなく、「騎士」10枚のうちどれか1枚を入れる。
   * ※「闇市場」の効果による購入でカード1枚を獲得したときに、リアクションとして「交易人」を手札から公開した場合、そのカード1枚は獲得されず、闇市場デッキの一番上に戻す。
   */

  onClick( operation: string, value: number, isButton: boolean ) {
    if ( !isButton ) return;
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


  async revealTop3Cards(
    cardPropertyList: CardProperty[],
    BlackMarketPileShuffled: BlackMarketPileCard[]
  ) {
    { // 上から3枚をめくる
      this.myRandomizerGroup.setBlackMarketPhase( BMPhase.init );
      BlackMarketPileShuffled.forEach( (e, i) => e.faceUp = (i < 3) );
      this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );
    }
    { // 3枚のうち1枚を購入するか，1枚も購入しない
      this.myRandomizerGroup.setBlackMarketPhase( BMPhase.buy );

      while (true) {
        const clickedElementValue
          = await new Promise<number>( resolve => this.promiseResolver['buy'] = resolve );

        if ( clickedElementValue === -1 ) break;  // don't buy

        if ( 0 <= clickedElementValue && clickedElementValue < 3 ) {  // buy a card
          const cardIndex = BlackMarketPileShuffled[ clickedElementValue ].cardIndex;
          const dialogRef = this.dialog.open( ConfirmDialogComponent );
          dialogRef.componentInstance.message = `「${cardPropertyList[cardIndex].nameJp}」を購入しますか？`;
          const yn = await dialogRef.afterClosed().toPromise();
          if ( yn === 'yes' ) {
            this.utils.removeAt( BlackMarketPileShuffled, clickedElementValue );
            this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );
            break;
          }
        }
      }
    }

    { // 残りは好きな順に闇市場デッキの下に置く
      this.myRandomizerGroup.setBlackMarketPhase( BMPhase.putOnTheBottom );

      while (true) {
        const clickedElementValue
          = await new Promise<number>( resolve =>
              this.promiseResolver['putOnTheBottom'] = resolve );
        if ( clickedElementValue === -1 ) break;

        const selectedElement = this.utils.removeAt( BlackMarketPileShuffled, clickedElementValue );
        BlackMarketPileShuffled.push( selectedElement );
        this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );
      }
    }

    // 確認
    BlackMarketPileShuffled.forEach( e => e.faceUp = false );  // reset
    this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );

    this.myRandomizerGroup.setBlackMarketPhase( BMPhase.init );
  }
}
