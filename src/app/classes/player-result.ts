export class PlayerResult {
  uid:       string  = '';  // databaseKey of users
  name:      string  = '';
  selected:  boolean = false;
  VP:        number  = 0;
  turnOrder: number  = 0;

  constructor( uid?: string, initObj?: {
    name:      string,
    selected:  boolean,
    VP:        number,
    turnOrder: number,
  } ) {
    this.uid = uid || '';
    if ( !initObj ) return;
    this.name      = ( initObj.name      || ''    );
    this.selected  = ( initObj.selected  || false );
    this.VP        = ( initObj.VP        || 0     );
    this.turnOrder = ( initObj.turnOrder || 0     );
  }
}
