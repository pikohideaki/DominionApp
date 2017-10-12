import { submatch } from '../my-own-library/utilities';

export class CardProperty {
  no:                     number = 0;
  cardID:                 string = '';
  name_jp:                string = '';
  name_jp_yomi:           string = '';
  name_eng:               string = '';
  expansionName:          string[] = [];
  cost:                   CardCost = new CardCost({ coin: 0, potion: 0, debt: 0 });
  category:               string = '';
  cardType:               string = '';
  cardTypes:              CardTypes = new CardTypes();
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
    expansionName:          string[],
    cost:                   CardCost,
    category:               string,
    cardType:               string,
    cardTypes:              CardTypes,
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

    this.no                     = ( initObj.no                     || 0 );
    this.cardID                 = ( initObj.cardID                 || '' );
    this.name_jp                = ( initObj.name_jp                || '' );
    this.name_jp_yomi           = ( initObj.name_jp_yomi           || '' );
    this.name_eng               = ( initObj.name_eng               || '' );
    this.expansionName          = ( initObj.expansionName          || [] );
    this.cost                   = new CardCost( initObj.cost );
    this.category               = ( initObj.category               || '' );
    this.cardType               = ( initObj.cardType               || '' );
    this.cardTypes              = new CardTypes( initObj.cardTypes );
    this.VP                     = ( initObj.VP                     || 0 );
    this.drawCard               = ( initObj.drawCard               || 0 );
    this.action                 = ( initObj.action                 || 0 );
    this.buy                    = ( initObj.buy                    || 0 );
    this.coin                   = ( initObj.coin                   || 0 );
    this.VPtoken                = ( initObj.VPtoken                || 0 );
    this.implemented            = !!initObj.implemented;
    this.randomizerCandidate    = !!initObj.randomizerCandidate;
    this.linkId                 = ( initObj.linkId                 || -1 );
  }


  isWideType(): boolean {
    return (this.cardTypes.EventCards || this.cardTypes.LandmarkCards);
  }

  costStr(): string {
    let costStr = '';
    if ( this.cost.coin > 0 || ( this.cost.potion === 0 && this.cost.debt === 0 ) ) {
      costStr += this.cost.coin.toString();
    }
    if ( this.cost.potion > 0 ) {
      for ( let i = 0; i < this.cost.potion; ++i ) { costStr += 'P'; }
    }
    if ( this.cost.debt   > 0 ) {
      costStr += `<${this.cost.debt.toString()}>`;
    }
    return costStr;
  }


  transform(): any {
    return {
      no                     : this.no,
      cardID                 : this.cardID,
      name_jp                : this.name_jp,
      name_jp_yomi           : this.name_jp_yomi,
      name_eng               : this.name_eng,
      expansionName          : this.expansionName.join('，'),
      cost_coin              : this.cost.coin,
      cost_potion            : this.cost.potion,
      cost_debt              : this.cost.debt,
      costStr                : this.costStr(),
      category               : this.category,
      cardTypesStr           : this.cardTypes.toStr(),
      cardTypes              : this.cardTypes,
      VP                     : this.VP,
      drawCard               : this.drawCard,
      action                 : this.action,
      buy                    : this.buy,
      coin                   : this.coin,
      VPtoken                : this.VPtoken,
      implemented            : ( this.implemented ?  '実装済み' : '未実装' ),
      randomizerCandidate    : ( this.randomizerCandidate ?  '〇' : '×' ),
    };
  }

}


export class CardTypes {
  Curse:         boolean = false;  // 呪い
  Action:        boolean = false;  // アクション
  Treasure:      boolean = false;  // 財宝
  Victory:       boolean = false;  // 勝利点
  Attack:        boolean = false;  // アタック
  Reaction:      boolean = false;  // リアクション
  Duration:      boolean = false;  // 持続
  Ruins:         boolean = false;  // 廃墟
  Prize:         boolean = false;  // 褒賞
  Looter:        boolean = false;  // 略奪者
  Shelter:       boolean = false;  // 避難所
  Knights:       boolean = false;  // 騎士
  Reserve:       boolean = false;  // リザーブ
  Traveller:     boolean = false;  // トラベラー
  Castle:        boolean = false;  // 城
  Gather:        boolean = false;  // 集合
  EventCards:    boolean = false;  // イベント
  LandmarkCards: boolean = false;  // ランドマーク

  constructor( initObj?: {
    Curse:         boolean,
    Action:        boolean,
    Treasure:      boolean,
    Victory:       boolean,
    Attack:        boolean,
    Reaction:      boolean,
    Duration:      boolean,
    Ruins:         boolean,
    Prize:         boolean,
    Looter:        boolean,
    Shelter:       boolean,
    Knights:       boolean,
    Reserve:       boolean,
    Traveller:     boolean,
    Castle:        boolean,
    Gather:        boolean,
    EventCards:    boolean,
    LandmarkCards: boolean,
  } ) {
    if ( !initObj ) return;
    this.Curse         = !!initObj.Curse;
    this.Action        = !!initObj.Action;
    this.Treasure      = !!initObj.Treasure;
    this.Victory       = !!initObj.Victory;
    this.Attack        = !!initObj.Attack;
    this.Reaction      = !!initObj.Reaction;
    this.Duration      = !!initObj.Duration;
    this.Ruins         = !!initObj.Ruins;
    this.Prize         = !!initObj.Prize;
    this.Looter        = !!initObj.Looter;
    this.Shelter       = !!initObj.Shelter;
    this.Knights       = !!initObj.Knights;
    this.Reserve       = !!initObj.Reserve;
    this.Traveller     = !!initObj.Traveller;
    this.Castle        = !!initObj.Castle;
    this.Gather        = !!initObj.Gather;
    this.EventCards    = !!initObj.EventCards;
    this.LandmarkCards = !!initObj.LandmarkCards;
  }


  toStr() {
    const resultArray = [];
    if ( this.Curse         ) resultArray.push( '呪い' );
    if ( this.Action        ) resultArray.push( 'アクション' );
    if ( this.Treasure      ) resultArray.push( '財宝' );
    if ( this.Victory       ) resultArray.push( '勝利点' );
    if ( this.Attack        ) resultArray.push( 'アタック' );
    if ( this.Reaction      ) resultArray.push( 'リアクション' );
    if ( this.Duration      ) resultArray.push( '持続' );
    if ( this.Ruins         ) resultArray.push( '廃墟' );
    if ( this.Prize         ) resultArray.push( '褒賞' );
    if ( this.Looter        ) resultArray.push( '略奪者' );
    if ( this.Shelter       ) resultArray.push( '避難所' );
    if ( this.Knights       ) resultArray.push( '騎士' );
    if ( this.Reserve       ) resultArray.push( 'リザーブ' );
    if ( this.Traveller     ) resultArray.push( 'トラベラー' );
    if ( this.Castle        ) resultArray.push( '城' );
    if ( this.Gather        ) resultArray.push( '集合' );
    if ( this.EventCards    ) resultArray.push( 'イベント' );
    if ( this.LandmarkCards ) resultArray.push( 'ランドマーク' );
    return resultArray.join('－');
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
  if ( cardPropertyList[cardIndex].cardTypes.Victory ) {
    return ( numberOfPlayer > 2 ? 12 : 8 );
  }
  if ( cardPropertyList[cardIndex].cardTypes.Prize ) return 1;
  return 10; /* KingdomCard default */
}
