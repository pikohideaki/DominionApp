import { Phase } from "./phase";

export class TurnInfo {
  phase:  Phase  = '';
  action: number = 1;
  buy:    number = 1;
  coin:   number = 0;

  constructor( dataObj?: {
    phase:  Phase,
    action: number,
    buy:    number,
    coin:   number,
  } ) {
    if ( !dataObj ) return;
    this.phase  = ( dataObj.phase  || '' );
    this.action = ( dataObj.action || 1 );
    this.buy    = ( dataObj.buy    || 1 );
    this.coin   = ( dataObj.coin   || 0 );
  }
}
