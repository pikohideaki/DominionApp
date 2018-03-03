import { DCard } from "./dcard";
import { CardType } from "../card-property";
import { filterRemove, objectEntries, objectForEach } from "../../my-own-library/utilities";
import { getDCardsByIdArray } from "./get-dcards-by-id-array";


export class PlayerCards {
  Deck:        DCard[] = [];
  DiscardPile: DCard[] = [];
  HandCards:   DCard[] = [];
  PlayArea:    DCard[] = [];
  Aside:       DCard[] = [];
  Open:        DCard[] = [];

  constructor( dataObj?: {
    Deck:        DCard[],
    DiscardPile: DCard[],
    HandCards:   DCard[],
    PlayArea:    DCard[],
    Aside:       DCard[],
    Open:        DCard[],
  } ) {
    if ( !dataObj ) return;
    objectForEach( dataObj, (_, key) => {
      this[key] = ( dataObj[key] || [] ).map( e => new DCard(e) );
    });
  }


  sortByCardType( dcards: DCard[] ): DCard[] {
    let sorted = dcards.sort( (a, b) => a.cardProperty.no - b.cardProperty.no );
    let Actions, Treasures, Victories;
    const f = (type: CardType) => ((d: DCard) => d.cardProperty.cardTypes.includes(type));
    [Actions,   sorted] = filterRemove( sorted, f('Action')   );
    [Treasures, sorted] = filterRemove( sorted, f('Treasure') );
    [Victories, sorted] = filterRemove( sorted, f('Victory')  );
    return [].concat( Actions, Treasures, Victories, sorted );
  }

  sortHandCards() {
    this.HandCards = this.sortByCardType( this.HandCards );
  }


  getDCards( cardIdArray?: number[], sort: boolean = false ): DCard[] {
    const allDCards: DCard[] = [].concat( ...objectEntries( this ) );
    const dcards = getDCardsByIdArray( cardIdArray, allDCards );
    return ( sort ? this.sortByCardType( dcards ) : dcards );
  }

  removeDCards( cardIdArray: number[] ) {
    objectForEach( this, (pile, key, obj) =>
      obj[key] = pile.filter( c => !cardIdArray.includes(c.id) ) );
  }

}
