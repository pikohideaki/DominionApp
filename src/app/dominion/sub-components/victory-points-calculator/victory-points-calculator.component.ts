import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject         } from 'rxjs/Subject';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeWhile';


import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { CardProperty, toListIndex } from '../../../classes/card-property';
import { SelectedCards        } from '../../../classes/selected-cards';
import { NumberOfVictoryCards } from '../../../classes/number-of-victory-cards';
import { utils } from '../../../my-own-library/utilities';


@Component({
  selector: 'app-victory-points-calculator',
  templateUrl: './victory-points-calculator.component.html',
  styleUrls: ['./victory-points-calculator.component.css']
})
export class VictoryPointsCalculatorComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() selectedCards$: Observable<SelectedCards>;  // selectedCardsに存在するもののみ表示
  @Input() resetVPCalculator$: Observable<number>;

  @Input()  numberOfVictoryCards$: Observable<NumberOfVictoryCards>;
  @Output() numberOfVictoryCardsChange = new EventEmitter<NumberOfVictoryCards>();
  @Output() VPtotalChange = new EventEmitter<number>();
  VPtotal$: Observable<number>;

  cardLongSideLength = 180;

  cardPropertyList$ = this.database.cardPropertyList$;


  VictoryCardsFiltered$;
  otherSettingsFiltered$;

  otherVictoryPoints = [
    { id: 'VPtoken'    , maxNumber: 999, title: '勝利点トークン' },
    { id: 'others'     , maxNumber: 999, title: 'その他' },
    { id: 'othersMinus', maxNumber: 999, title: 'その他（マイナス得点）' },
  ];


  // initializers
  private VictoryCards = [
    { id: 'Curse'           , maxNumber: 30, displayWhen: 'always' },
    { id: 'Estate'          , maxNumber: 12, displayWhen: 'always' },
    { id: 'Duchy'           , maxNumber: 12, displayWhen: 'always' },
    { id: 'Province'        , maxNumber: 12, displayWhen: 'always' },
    { id: 'Colony'          , maxNumber: 12, displayWhen: 'Prosperity' },
    { id: 'Great_Hall'      , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Nobles'          , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Harem'           , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Farmland'        , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Island'          , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Tunnel'          , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Dame_Josephine'  , maxNumber:  1, displayWhen: 'KnightsIsInSupply' },
    { id: 'Overgrown_Estate', maxNumber:  1, displayWhen: 'DarkAges' },
    { id: 'Mill'            , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Cemetery'        , maxNumber: 12, displayWhen: 'isInSupply' },

    { id: 'Gardens'         , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Duke'            , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Vineyard'        , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Fairgrounds'     , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Silk_Road'       , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Feodum'          , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Distant_Lands'   , maxNumber: 12, displayWhen: 'isInSupply' },
    { id: 'Pasture'         , maxNumber: 12, displayWhen: 'ShepherdIsInSupply' },

    { id: 'Humble_Castle'   , maxNumber:  2, displayWhen: 'CastlesIsInSupply' },
    { id: 'Crumbling_Castle', maxNumber:  1, displayWhen: 'CastlesIsInSupply' },
    { id: 'Small_Castle'    , maxNumber:  2, displayWhen: 'CastlesIsInSupply' },
    { id: 'Haunted_Castle'  , maxNumber:  1, displayWhen: 'CastlesIsInSupply' },
    { id: 'Opulent_Castle'  , maxNumber:  2, displayWhen: 'CastlesIsInSupply' },
    { id: 'Sprawling_Castle', maxNumber:  1, displayWhen: 'CastlesIsInSupply' },
    { id: 'Grand_Castle'    , maxNumber:  1, displayWhen: 'CastlesIsInSupply' },
    { id: 'Kings_Castle'    , maxNumber:  2, displayWhen: 'CastlesIsInSupply' },
  ];

  private otherSettings = [
    { id: 'DeckSize', title: '山札の枚数（庭園）',
      by: 10, maxNumber: 999, displayIfExists: 'Gardens' },
    { id: 'numberOfActionCards', title: 'アクションカードの枚数（ブドウ園）',
      by:  3, maxNumber: 999, displayIfExists: 'Vineyard' },
    { id: 'numberOfDifferentlyNamedCards', title: '異なる名前のカード枚数（品評会）',
      by:  5, maxNumber: 999, displayIfExists: 'Fairgrounds' },
    { id: 'numberOfSilvers', title: '銀貨の枚数（封土）',
      by:  3, maxNumber:  40, displayIfExists: 'Feodum' },
  ];



  constructor(
    private database: FireDatabaseService,
  ) {
  }

  ngOnInit() {
    this.VPtotal$ = this.numberOfVictoryCards$.map( e => e.VPtotal() );

    this.VictoryCardsFiltered$ = this.selectedCards$.combineLatest(
        this.cardPropertyList$,
        (selectedCards, cardPropertyList) => {
          const selectedCardsAll = selectedCards.concatAllCards();
          const isInSupply = cardId =>
            selectedCardsAll.map( e => cardPropertyList[e].cardId ).includes( cardId );

          return this.VictoryCards.filter( e => { switch ( e.displayWhen ) {
            case 'always'             : return true;
            case 'isInSupply'         : return isInSupply( e.id );
            case 'Prosperity'         : return selectedCards.Prosperity;
            case 'DarkAges'           : return selectedCards.DarkAges;
            case 'KnightsIsInSupply'  : return isInSupply( 'Knights' );
            case 'CastlesIsInSupply'  : return isInSupply( 'Castles' );
            case 'ShepherdIsInSupply' : return isInSupply( 'Shepherd' );
            default                   : return true;
          } });
        });

    this.otherSettingsFiltered$ = this.selectedCards$.combineLatest(
        this.cardPropertyList$,
        (selectedCards, cardPropertyList) => {
          const selectedCardsAll = selectedCards.concatAllCards();
          const isInSupply = cardId =>
            selectedCardsAll.map( e => cardPropertyList[e].cardId )
                            .includes( cardId );
          return this.otherSettings.filter( e => isInSupply( e.displayIfExists ) );
        });

    this.resetVPCalculator$.withLatestFrom( this.numberOfVictoryCards$, (_, n) => n )
      .skip(1)
      .takeWhile( () => this.alive )
      .subscribe( numberOfVictoryCards => this.resetNumbers( numberOfVictoryCards ) );
  }

  ngOnDestroy() {
    this.alive = false;
  }



  private updateVPtotal( numberOfVictoryCards: NumberOfVictoryCards ) {
    this.VPtotalChange.emit( numberOfVictoryCards.VPtotal() );
    this.numberOfVictoryCardsChange.emit( numberOfVictoryCards );
  }


  cardProperty( cardId, cardPropertyList ) {
    const index = toListIndex( cardPropertyList, cardId );
    if ( index < 0 ) return;
    return cardPropertyList[ index ];
  }


  VPperCard(
    numberOfVictoryCards: NumberOfVictoryCards,
    cardId: string
  ) {
    return numberOfVictoryCards.VPperCard( cardId );
  }


  decrement(
    numberOfVictoryCards: NumberOfVictoryCards,
    VictoryCardId: string,
    by: number = 1
  ) {
    if ( numberOfVictoryCards[ VictoryCardId ] <= 0 ) return;
    numberOfVictoryCards[ VictoryCardId ] -= by;

    numberOfVictoryCards[ VictoryCardId ]
     = Math.max( 0, numberOfVictoryCards[ VictoryCardId ] );

    if ( VictoryCardId === 'Distant_Lands' ) {
      numberOfVictoryCards.Distant_Lands_on_TavernMat
        = Math.min( numberOfVictoryCards.Distant_Lands,
                    numberOfVictoryCards.Distant_Lands_on_TavernMat );
    }
    this.updateVPtotal( numberOfVictoryCards );
  }

  increment(
    numberOfVictoryCards: NumberOfVictoryCards,
    VictoryCardId: string,
    by: number = 1
  ) {
    numberOfVictoryCards[ VictoryCardId ] += by;

    const VictoryCardId__ = ( VictoryCardId === 'Distant_Lands_on_TavernMat'
                                ? 'Distant_Lands'
                                : VictoryCardId );
    const max = [].concat( this.VictoryCards,
                           this.otherVictoryPoints,
                           this.otherSettings )
                  .find( e => e.id === VictoryCardId__ ).maxNumber;
    numberOfVictoryCards[ VictoryCardId ]
     = Math.min( max, numberOfVictoryCards[ VictoryCardId ] );
    if ( VictoryCardId === 'Distant_Lands_on_TavernMat' ) {
      numberOfVictoryCards.Distant_Lands
        = Math.max( numberOfVictoryCards.Distant_Lands,
                    numberOfVictoryCards.Distant_Lands_on_TavernMat );
    }
    this.updateVPtotal( numberOfVictoryCards );
  }

  setValue(
    numberOfVictoryCards: NumberOfVictoryCards,
    VictoryCardId:        string,
    value:                number,
  ) {
    numberOfVictoryCards[ VictoryCardId ] = value;
    this.updateVPtotal( numberOfVictoryCards );
  }

  resetNumbers( numberOfVictoryCards: NumberOfVictoryCards ) {
    utils.object.forEach(
        numberOfVictoryCards,
        (_, key) => numberOfVictoryCards[key] = 0 );
    this.updateVPtotal( numberOfVictoryCards );
  }

}
