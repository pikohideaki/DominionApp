import { Injectable } from '@angular/core';
import { CardProperty } from '../../../classes/card-property';
import { NumberOfVictoryCards } from '../../../classes/number-of-victory-cards';


@Injectable()
export class NumberOfVictoryCardsStringService {

  constructor() { }

  toStr( nvc: NumberOfVictoryCards, cardPropertyList: CardProperty[] ): string {
    const result = [];

    if ( nvc.VPtoken !== 0 ) result.push(`VPトークン(${nvc.VPtoken})`);
    if ( nvc.others - nvc.othersMinus !== 0 ) {
      result.push(`その他(${nvc.others - nvc.othersMinus})`);
    }

    const toNameJp = (id =>
      ( cardPropertyList.find( e => e.cardId === id ) || new CardProperty() ).nameJp );

    [ 'Curse',
      'Estate',
      'Duchy',
      'Province',
      'Colony',
      'Great_Hall',
      'Nobles',
      'Harem',
      'Farmland',
      'Island',
      'Tunnel',
      'Dame_Josephine',
      'Mill',
      'Cemetery',
      'Gardens',
      'Duke',
      'Vineyard',
      'Fairgrounds',
      'Silk_Road',
      'Feodum',
      'Distant_Lands',
      'Pasture',
    ].forEach( id => {
      if ( nvc[id] !== 0 ) {
        result.push(`${toNameJp(id)}(${nvc.VPperCard(id)}x${nvc[id]})`);
      }
    });

    const CastleVPtotal
      = [ 'Humble_Castle',
          'Crumbling_Castle',
          'Small_Castle',
          'Haunted_Castle',
          'Opulent_Castle',
          'Sprawling_Castle',
          'Grand_Castle',
          'Kings_Castle'
        ].map( cardId => nvc.VPperCard(cardId) * nvc[cardId] )
          .reduce( (prev, curr) => prev + curr );

    if ( CastleVPtotal !== 0 ) {
      result.push(`城(${CastleVPtotal})`);
    }

    return result.join('，');
  }
}

