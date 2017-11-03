

export function entries( obj: any ): { key: string, value: any }[] {
  if ( !obj ) return [];
  return Object.keys(obj).map( key => ({ key: key, value: obj[key] }) );
}


export function objectKeysAsNumber( object: Object ): number[] {
  return Object.keys( object ).map( e => Number(e) );
}

export function submatch( target: string, key: string, ignoreCase: boolean = false ): boolean {
  if ( ignoreCase ) {
    return submatch( target.toUpperCase(), key.toUpperCase() );
  }
  return target.indexOf( key ) !== -1;
}

export function shuffle( array: any[] ): void {
  const shuffled = getShuffled( array );
  shuffled.forEach( (v, i) => array[i] = v );
}


export function getShuffled( array: any[] ): any[] {
  return array
      .map( e => [e, Math.random()] )
      .sort( (x, y) => x[1] - y[1] )
      .map( pair => pair[0] );
}


export function permutation( n: number ): number[] {
  const ar = new Array<number>(n);
  for ( let i = 0; i < n; ++i ) { ar[i] = i; }
  return getShuffled( ar );
}

export function filterRemove<T>( array: Array<T>, f: (T) => boolean ): [ Array<T>, Array<T> ] {
  const rest = array.filter( e => !f(e) );
  return [ array.filter(f), rest ];
}


export function toYMD( date: Date, delimiter: string = '/' ): string {
  const padzero = ( str => ('00' + str).slice(-2) );
  return date.getFullYear()
      + delimiter
      + padzero(date.getMonth() + 1)
      + delimiter
      + padzero(date.getDate());
}




export function isToday( date: Date ) {
  // Get today's date
  const todaysDate = new Date();

  // call setHours to take the time out of the comparison
  return ( date.setHours(0, 0, 0, 0).valueOf() === todaysDate.setHours(0, 0, 0, 0).valueOf() );
}
