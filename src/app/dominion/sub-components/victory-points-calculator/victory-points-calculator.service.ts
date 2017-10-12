import { Injectable } from '@angular/core';

import { NumberOfVictoryCards } from '../../../classes/number-of-victory-cards';


@Injectable()
export class VictoryPointsCalculatorService {

  constructor() { }


  total( numberOfVictoryCards: NumberOfVictoryCards ): number {
    let VPtotal = 0;
    Object.keys( numberOfVictoryCards ).forEach( key => VPtotal += this.calc( key, numberOfVictoryCards ) );
    return VPtotal;
  }

  calc( name: string, numberOfVictoryCards: NumberOfVictoryCards ): number {
    return numberOfVictoryCards[ name ] * this.VPperCard( name, numberOfVictoryCards );
  }


  VPperCard( name: string, numberOfVictoryCards: NumberOfVictoryCards ): number {
    switch (name) {
      case 'VPtoken'          : return  1;
      case 'others'           : return  1;
      case 'othersMinus'      : return -1;
      case 'Curse'            : return -1;
      case 'Estate'           : return  1;
      case 'Duchy'            : return  3;
      case 'Province'         : return  6;
      case 'Colony'           : return 10;
      case 'Great_Hall'       : return  1;
      case 'Nobles'           : return  2;
      case 'Harem'            : return  2;
      case 'Farmland'         : return  2;
      case 'Island'           : return  2;
      case 'Tunnel'           : return  2;
      case 'Dame_Josephine'   : return  2;
      case 'Overgrown_Estate' : return  0;


      // 庭園 : デッキ枚数 ÷ 10 点
      case 'Gardens'     : return Math.floor( numberOfVictoryCards.DeckSize / 10 );

      // 公爵 : 公領1枚につき1点
      case 'Duke'        : return numberOfVictoryCards.Duchy;

      // ブドウ園 : アクションカード3枚につき1点
      case 'Vineyard'    : return Math.floor( numberOfVictoryCards.numberOfActionCards / 3 );

      // 品評会 : 異なる名前のカード5枚につき2勝利点
      case 'Fairgrounds' : return 2 * Math.floor( numberOfVictoryCards.numberOfDifferentlyNamedCards / 5 );

      // シルクロード : 勝利点カード4枚につき1点
      case 'Silk_Road'   : return Math.floor( numberOfVictoryCards.countVictoryCards() / 4 );

      // // 封土 : 銀貨3枚につき1点
      case 'Feodum'      : return Math.floor( numberOfVictoryCards.numberOfSilvers / 3 );

      // 遠隔地 : 酒場マットの上にあれば4点，そうでなければ0点
      case 'Distant_Lands' : return 0;
      case 'Distant_Lands_on_TavernMat' : return 4;

      // Castles
      case 'Humble_Castle'    : return numberOfVictoryCards.countCastles();
      case 'Crumbling_Castle' : return 1;
      case 'Small_Castle'     : return 2;
      case 'Haunted_Castle'   : return 2;
      case 'Opulent_Castle'   : return 3;
      case 'Sprawling_Castle' : return 4;
      case 'Grand_Castle'     : return 5;
      case 'Kings_Castle'     : return 2 * numberOfVictoryCards.countCastles();

      default : return 0;
    }
  }
}
