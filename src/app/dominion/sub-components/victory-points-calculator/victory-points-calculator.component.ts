import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Observable      } from 'rxjs/Observable';
import { Subject         } from 'rxjs/Subject';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeWhile';


import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { VictoryPointsCalculatorService } from './victory-points-calculator.service';

import { CardProperty, toListIndex } from '../../../classes/card-property';
import { SelectedCards        } from '../../../classes/selected-cards';
import { NumberOfVictoryCards } from '../../../classes/number-of-victory-cards';
import { UtilitiesService } from '../../../my-own-library/utilities.service';


@Component({
  providers: [ VictoryPointsCalculatorService ],
  selector: 'app-victory-points-calculator',
  templateUrl: './victory-points-calculator.component.html',
  styleUrls: ['./victory-points-calculator.component.css']
})
export class VictoryPointsCalculatorComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() selectedCards$: Observable<SelectedCards>;  // selectedCardsに存在するもののみ表示
  @Input() resetVPCalculator$: Observable<number>;

  @Output() VPtotalChange = new EventEmitter<number>();
  VPtotal$ = this.VPtotalChange.asObservable().startWith(0);

  @Output() numberOfVictoryCardsChange = new EventEmitter<NumberOfVictoryCards>();

  cardLongSideLength = 180;
  numberOfVictoryCards: NumberOfVictoryCards = new NumberOfVictoryCards();

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
    private database: CloudFirestoreMediatorService,
    private calc: VictoryPointsCalculatorService,
    private utils: UtilitiesService
  ) {
  }

  ngOnInit() {
    this.VictoryCardsFiltered$ = Observable.combineLatest(
        this.cardPropertyList$,
        this.selectedCards$,
        (cardPropertyList, selectedCards) => {
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

    this.otherSettingsFiltered$ = Observable.combineLatest(
        this.cardPropertyList$,
        this.selectedCards$,
        (cardPropertyList, selectedCards) => {
          const selectedCardsAll = selectedCards.concatAllCards();
          const isInSupply = cardId =>
            selectedCardsAll.map( e => cardPropertyList[e].cardId )
                            .includes( cardId );
          return this.otherSettings.filter( e => isInSupply( e.displayIfExists ) );
        });

    this.resetVPCalculator$
      .skip(1)
      .takeWhile( () => this.alive )
      .subscribe( () => this.resetNumbers() );
  }

  ngOnDestroy() {
    this.alive = false;
  }



  private updateVPtotal() {
    const VPtotal = this.calc.total( this.numberOfVictoryCards );
    this.VPtotalChange.emit( VPtotal );
    this.numberOfVictoryCardsChange.emit( this.numberOfVictoryCards );
  }


  cardProperty( cardId, cardPropertyList ) {
    const index = toListIndex( cardPropertyList, cardId );
    if ( index < 0 ) return;
    return cardPropertyList[ index ];
  }


  VPperCard( cardId: string ) {
    return this.calc.VPperCard( cardId, this.numberOfVictoryCards );
  }


  decrement( VictoryCardId: string, by: number = 1 ) {
    if ( this.numberOfVictoryCards[ VictoryCardId ] <= 0 ) return;
    this.numberOfVictoryCards[ VictoryCardId ] -= by;

    this.numberOfVictoryCards[ VictoryCardId ]
     = Math.max( 0, this.numberOfVictoryCards[ VictoryCardId ] );

    if ( VictoryCardId === 'Distant_Lands' ) {
      this.numberOfVictoryCards.Distant_Lands_on_TavernMat
        = Math.min( this.numberOfVictoryCards.Distant_Lands,
                    this.numberOfVictoryCards.Distant_Lands_on_TavernMat );
    }
    this.updateVPtotal();
  }

  increment( VictoryCardId: string, by: number = 1 ) {
    this.numberOfVictoryCards[ VictoryCardId ] += by;

    const VictoryCardId__ = ( VictoryCardId === 'Distant_Lands_on_TavernMat'
                                ? 'Distant_Lands'
                                : VictoryCardId );
    const max = [].concat( this.VictoryCards,
                           this.otherVictoryPoints,
                           this.otherSettings )
                  .find( e => e.id === VictoryCardId__ ).maxNumber;
    this.numberOfVictoryCards[ VictoryCardId ]
     = Math.min( max, this.numberOfVictoryCards[ VictoryCardId ] );
    if ( VictoryCardId === 'Distant_Lands_on_TavernMat' ) {
      this.numberOfVictoryCards.Distant_Lands
        = Math.max( this.numberOfVictoryCards.Distant_Lands,
                    this.numberOfVictoryCards.Distant_Lands_on_TavernMat );
    }
    this.updateVPtotal();
  }

  setValue( VictoryCardId, value ) {
    this.numberOfVictoryCards[ VictoryCardId ] = value;
    this.updateVPtotal();
  }

  resetNumbers() {
    this.utils.objectForEach(
        this.numberOfVictoryCards,
        (_, key) => this.numberOfVictoryCards[key] = 0 );
    this.updateVPtotal();
  }

}
