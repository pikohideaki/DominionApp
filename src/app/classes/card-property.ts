import { submatch } from '../my-own-library/utilities';


type CardType = (
       'Curse'
      |'Action'
      |'Treasure'
      |'Victory'
      |'Attack'
      |'Reaction'
      |'Duration'
      |'Ruins'
      |'Prize'
      |'Looter'
      |'Shelter'
      |'Knights'
      |'Reserve'
      |'Traveller'
      |'Castle'
      |'Gather'
      |'EventCards'
      |'LandmarkCards'
    );

export class CardProperty {
  no:                     number = 0;
  cardID:                 string = '';
  name_jp:                string = '';
  name_jp_yomi:           string = '';
  name_eng:               string = '';
  expansionName:          string[] = [];
  cost:                   CardCost = new CardCost({ coin: 0, potion: 0, debt: 0 });
  category:               string = '';
  cardTypes:              CardType[];
  VP:                     number = 0;
  drawCard:               number = 0;
  action:                 number = 0;
  buy:                    number = 0;
  coin:                   number = 0;
  VPtoken:                number = 0;
  implemented:            boolean = false;
  randomizerCandidate:    boolean = false;
  linkId:                 number = -1;

  constructor( initObj?: {
    no:                     number,
    cardID:                 string,
    name_jp:                string,
    name_jp_yomi:           string,
    name_eng:               string,
    expansionName:          string,
    cost:                   CardCost,
    category:               string,
    cardTypes:              string,
    VP:                     number,
    drawCard:               number,
    action:                 number,
    buy:                    number,
    coin:                   number,
    VPtoken:                number,
    implemented:            boolean,
    randomizerCandidate:    boolean,
    linkId:                 number,
  }) {
    if ( !initObj ) return;

    this.no                     = ( initObj.no            || 0 );
    this.cardID                 = ( initObj.cardID        || '' );
    this.name_jp                = ( initObj.name_jp       || '' );
    this.name_jp_yomi           = ( initObj.name_jp_yomi  || '' );
    this.name_eng               = ( initObj.name_eng      || '' );
    this.expansionName          = ( initObj.expansionName || '' ).split(',');
    this.cost                   = new CardCost( initObj.cost );
    this.category               = ( initObj.category      || '' );
    this.cardTypes              = <CardType[]>( initObj.cardTypes || '' ).split(',');
    this.VP                     = ( initObj.VP            || 0 );
    this.drawCard               = ( initObj.drawCard      || 0 );
    this.action                 = ( initObj.action        || 0 );
    this.buy                    = ( initObj.buy           || 0 );
    this.coin                   = ( initObj.coin          || 0 );
    this.VPtoken                = ( initObj.VPtoken       || 0 );
    this.implemented            = !!initObj.implemented;
    this.randomizerCandidate    = !!initObj.randomizerCandidate;
    this.linkId                 = ( initObj.linkId        || -1 );
  }


  isWideType(): boolean {
    return (this.cardTypes.includes('EventCards') || this.cardTypes.includes('LandmarkCards') );
  }

  transformAll(): any {
    return {
      no                     : this.no,
      cardID                 : this.cardID,
      name_jp                : this.name_jp,
      name_jp_yomi           : this.name_jp_yomi,
      name_eng               : this.name_eng,
      expansionName          : transform( 'expansionName', this.expansionName ),
      cost_coin              : this.cost.coin,
      cost_potion            : this.cost.potion,
      cost_debt              : this.cost.debt,
      costStr                : transform( 'cost', this.cost ),
      category               : this.category,
      cardTypesStr           : transform( 'cardTypes', this.cardTypes ),
      cardTypes              : this.cardTypes,
      VP                     : this.VP,
      drawCard               : this.drawCard,
      action                 : this.action,
      buy                    : this.buy,
      coin                   : this.coin,
      VPtoken                : this.VPtoken,
      implemented            : transform( 'implemented', this.implemented ),
      randomizerCandidate    : transform( 'randomizerCandidate', this.randomizerCandidate ),
    };
  }
}






export function transform( property: string, value ) {
  switch ( property ) {

    case 'cardTypes' :
      return value.map( e => {
        switch (e) {
          case 'Curse' :         return '呪い';
          case 'Action' :        return 'アクション';
          case 'Treasure' :      return '財宝';
          case 'Victory' :       return '勝利点';
          case 'Attack' :        return 'アタック';
          case 'Reaction' :      return 'リアクション';
          case 'Duration' :      return '持続';
          case 'Ruins' :         return '廃墟';
          case 'Prize' :         return '褒賞';
          case 'Looter' :        return '略奪者';
          case 'Shelter' :       return '避難所';
          case 'Knights' :       return '騎士';
          case 'Reserve' :       return 'リザーブ';
          case 'Traveller' :     return 'トラベラー';
          case 'Castle' :        return '城';
          case 'Gather' :        return '集合';
          case 'EventCards' :    return 'イベント';
          case 'LandmarkCards' : return 'ランドマーク';
          default: return '';
        }
      } );

    case 'cost' :
      return value.toStr();

    case 'implemented' :
      return ( value ?  '実装済み' : '未実装' );

    case 'randomizerCandidate' :
      return ( value ?  '〇' : '×' );

    case 'no' :
    case 'cardID' :
    case 'expansionName' :
    case 'name_jp' :
    case 'name_jp_yomi' :
    case 'name_eng' :
    case 'category' :
    case 'VP' :
    case 'drawCard' :
    case 'action' :
    case 'buy' :
    case 'coin' :
    case 'VPtoken' :
    case 'linkId' :
      return value;

    default:
      throw new Error(`unknown property name '${property}'`);
  }
}



export class CardCost {
  coin   = 0;
  potion = 0;
  debt   = 0;

  constructor( initObj: { coin: number, potion: number, debt: number } ) {
    if ( !initObj ) return;
    this.coin   = ( initObj.coin   || 0 );
    this.potion = ( initObj.potion || 0 );
    this.debt   = ( initObj.debt   || 0 );
  }


  toStr(): string {
    let result = '';
    if ( this.coin > 0 || ( this.potion === 0 && this.debt === 0 ) ) {
      result += this.coin.toString();
    }
    if ( this.potion > 0 ) {
      for ( let i = 0; i < this.potion; ++i ) result += 'P';
    }
    if ( this.debt   > 0 ) {
      result += `<${this.debt.toString()}>`;
    }
    return result;
  }

}

export function toListIndex( cardPropertyList: CardProperty[], cardID: string ) {
  return cardPropertyList.findIndex( e => e.cardID === cardID );
}


export function numberToPrepare(
    cardPropertyList: CardProperty[],
    cardIndex,
    numberOfPlayer: number,
    DarkAges: boolean
  ): number {
  switch ( cardPropertyList[cardIndex].cardID ) {
    case 'Copper'  : return 60;
    case 'Silver'  : return 40;
    case 'Gold'    : return 30;
    case 'Platinum': return 12;
    case 'Potion'  : return 16;
    case 'Curse'   : return ( numberOfPlayer - 1 ) * 10;
    default : break;
  }
  if ( cardPropertyList[cardIndex].cardID === 'Estate' ) {
    if ( DarkAges ) return ( numberOfPlayer > 2 ? 12 : 8 );
    return numberOfPlayer * 3 + ( numberOfPlayer > 2 ? 12 : 8 );
  }
  if ( cardPropertyList[cardIndex].cardTypes.includes('Victory') ) {
    return ( numberOfPlayer > 2 ? 12 : 8 );
  }
  if ( cardPropertyList[cardIndex].cardTypes.includes('Prize') ) return 1;
  return 10; /* KingdomCard default */
}
