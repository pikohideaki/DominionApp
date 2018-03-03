import { CardProperty } from "../card-property";


export class DCard {  // Dominion card
  cardProperty:  CardProperty = new CardProperty();
  id:            number  = 0;
  faceUp:        boolean[] = [];
  isButton:      boolean[] = [];
  rotation:      number  = 0;  // 0 - 360

  constructor( dataObj?: {
    cardProperty:  CardProperty,
    id:            number,
    faceUp:        boolean[],
    isButton:      boolean[],
    rotation:      number,
  } ) {
    if ( !dataObj ) return;
    this.cardProperty  = ( (new CardProperty()).from( dataObj.cardProperty ) || new CardProperty() );
    this.id            = ( dataObj.id            || 0  );
    this.faceUp        = ( dataObj.faceUp        || [] );
    this.isButton      = ( dataObj.isButton      || [] );
    this.rotation      = ( dataObj.rotation      || 0  );
  }
}
