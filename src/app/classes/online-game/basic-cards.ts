import { DCard } from './dcard';
import { utils } from '../../my-own-library/utilities';
import { getDCardsByIdArray } from './get-dcards-by-id-array';


export class BasicCards {
  Curse:    DCard[] = [];
  Copper:   DCard[] = [];
  Silver:   DCard[] = [];
  Gold:     DCard[] = [];
  Estate:   DCard[] = [];
  Duchy:    DCard[] = [];
  Province: DCard[] = [];
  Platinum: DCard[] = [];
  Colony:   DCard[] = [];
  Potion:   DCard[] = [];

  constructor( dataObj?: {
    Curse:    DCard[],
    Copper:   DCard[],
    Silver:   DCard[],
    Gold:     DCard[],
    Estate:   DCard[],
    Duchy:    DCard[],
    Province: DCard[],
    Platinum: DCard[],
    Colony:   DCard[],
    Potion:   DCard[],
  } ) {
    if ( !dataObj ) return;
    utils.object.forEach( dataObj, (_, key) => {
      this[key] = ( dataObj[key] || [] ).map( e => new DCard(e) );
    });
  }

  getDCards( cardIdArray?: number[] ): DCard[] {
    const allDCards: DCard[] = [].concat( ...utils.object.entries( this ) );
    return getDCardsByIdArray( cardIdArray, allDCards );
  }

  removeDCards( cardIdArray: number[] ) {
    utils.object.forEach( this, (pile, key, obj) =>
      obj[key] = pile.filter( c => !cardIdArray.includes(c.id) ) );
  }

}
