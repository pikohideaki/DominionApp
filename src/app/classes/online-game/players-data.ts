export class PlayerData {
  VPtoken:    number = 0;
  // VPtotal:    number = 0;
  // turnCount:  number = 0;
  // debt
  // vcoin

  constructor( dataObj?: {
    VPtoken:   number,
    // VPtotal:   number,
    // turnCount: number,
  } ) {
    if ( !dataObj ) return;
    this.VPtoken   = ( dataObj.VPtoken   || 0 );
    // this.VPtotal   = ( dataObj.VPtotal   || 0 );
    // this.turnCount = ( dataObj.turnCount || 0 );
  }
}
