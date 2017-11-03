import { Injectable } from '@angular/core';


export class Stopwatch {
  private _startTime;
  private _endTime;
  private _result = 0;
  private _name = '';

  constructor( name = '' ) {
    this._name = name;
  }

  start( log = false ) {
    this._startTime = (new Date()).valueOf();
    this._result = 0;
    if ( log ) console.log( `${this._name} started.` );
  }

  stop ( log = false ) {
    this._endTime = (new Date()).valueOf();
    this._result = this._endTime - this._startTime;
    if ( log ) console.log( `${this._name} stopped.` );
  }

  result() {
    return this._result;
  }

  printResult() {
    console.log( `${this._name} ${this._result} msec` );
  }

}



@Injectable()
export class UtilitiesService {

  constructor() { }


  /* localStorage */
  localStorage_set( key: string, value: any ) {
    localStorage.setItem( key, JSON.stringify( value ) );
  }

  localStorage_get( key: string ) {
    return JSON.parse( localStorage.getItem( key ) );
  }

  localStorage_has( key: string ): boolean {
    return ( localStorage.getItem( key ) != null );
  }



  /* string */
  submatch( target: string, key: string, ignoreCase: boolean = false ): boolean {
    if ( ignoreCase ) {
      return this.submatch( target.toUpperCase(), key.toUpperCase() );
    }
    return target.indexOf( key ) !== -1;
  }



  /* Object */
  objectKeysAsNumber( object: Object ): number[] {
    return Object.keys( object || {} ).map( e => Number(e) );
  }

  objectForEach( object: Object, f: (element: any, key?: string, object?: any) => any ) {
    Object.keys( object || {} ).forEach( key => f( object[key], key, object ) );
  }

  objectMap( object: Object, f: (element: any, key?: string, object?: any) => any ) {
    return Object.keys( object || {} ).map( key => f( object[key], key, object ) );
  }

  copyObject( object: Object ) {
    return JSON.parse( JSON.stringify( object || {} ) );
  }


  /* Date */
  weekNumber( date: Date ) {
    const date0Saturday = date.getDate() - 1 + ( 6 - date.getDay() );
    return Math.floor( date0Saturday / 7 );
  }

  isToday( date: Date ) {
    // Get today's date
    const todaysDate = new Date();

    // call setHours to take the time out of the comparison
    return ( date.setHours(0, 0, 0, 0).valueOf() === todaysDate.setHours(0, 0, 0, 0).valueOf() );
  }

  getAllDatesIn( year: number, month: number ): Date[] {
    const firstDateOfMonth = new Date( year, month, 1, 0, 0, 0, 0 );
    return this.numSeq( 1, 31 )
            .filter( dateNumber => {
              const date = new Date( firstDateOfMonth.setDate( dateNumber ) );
              return date.getMonth() === month;
            })
            .map( dateNumber => new Date( year, month, dateNumber, 0, 0, 0, 0 ) );
  }

  compareDates( date1: Date, date2: Date ): -1|0|1 {
    if ( date1.getFullYear()     > date2.getFullYear()     ) return 1;
    if ( date1.getFullYear()     < date2.getFullYear()     ) return -1;
    if ( date1.getMonth()        > date2.getMonth()        ) return 1;
    if ( date1.getMonth()        < date2.getMonth()        ) return -1;
    if ( date1.getDate()         > date2.getDate()         ) return 1;
    if ( date1.getDate()         < date2.getDate()         ) return -1;
    if ( date1.getHours()        > date2.getHours()        ) return 1;
    if ( date1.getHours()        < date2.getHours()        ) return -1;
    if ( date1.getMinutes()      > date2.getMinutes()      ) return 1;
    if ( date1.getMinutes()      < date2.getMinutes()      ) return -1;
    if ( date1.getSeconds()      > date2.getSeconds()      ) return 1;
    if ( date1.getSeconds()      < date2.getSeconds()      ) return -1;
    if ( date1.getMilliseconds() > date2.getMilliseconds() ) return 1;
    if ( date1.getMilliseconds() < date2.getMilliseconds() ) return -1;
    return 0;
  }

  getDayStringJp( date ) {
    return ['日', '月', '火', '水', '木', '金', '土'][ date.getDay() ];
  }

  getDayStringEng( date ) {
    return [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][ date.getDay() ];
  }

  toYMD( date: Date, delimiter: string = '/' ): string {
    const padzero = ( str => ('00' + str).slice(-2) );
    return date.getFullYear()
        + delimiter
        + padzero(date.getMonth() + 1)
        + delimiter
        + padzero(date.getDate());
  }

  toHM( date: Date, delimiter: string = ':' ): string {
    const padzero = ( str => ('00' + str).slice(-2) );
    return padzero(date.getHours())
        + delimiter
        + padzero(date.getMinutes());
  }

  toHMS( date: Date, delimiter: string = ':' ): string {
    const padzero = ( str => ('00' + str).slice(-2) );
    return padzero(date.getHours())
        + delimiter
        + padzero(date.getMinutes())
        + delimiter
        + padzero(date.getSeconds());
  }

  toYMDHMS( date: Date ): string {
    return `${this.toYMD( date )} ${this.toHMS( date )}`;
  }

  getYestereday( date: Date ): Date {
    const yestereday = new Date( date );
    yestereday.setDate( yestereday.getDate() - 1 );  // yesterday
    return yestereday;
  }

  getTomorrow( date: Date ): Date {
    const tomorrow = new Date( date );
    tomorrow.setDate( tomorrow.getDate() + 1 );  // tomorrow
    return tomorrow;
  }

  getMidnightOfDate( date: Date ): Date {
    const midnight = new Date( date );
    midnight.setHours(0);
    midnight.setMinutes(0);
    midnight.setSeconds(0);
    midnight.setMilliseconds(0);
    return midnight;
  }



  integerDivision( a: number, b: number ): number {
    return Math.floor( a / b );
  }

  /* float */
  roundAt( val: number, precision: number ) {
    const digit = Math.pow(10, precision);
    val *= digit;
    val = Math.round( val );
    return val / digit;
  }



  /* random */
  randomNumber( Min: number, Max: number ): number {
    return Min + Math.floor( Math.random() * ( Max - Min + 1 ) );
  }

  getRandomValue<T>( array: Array<T> ): T {
    return array[ this.randomNumber( 0, array.length - 1 ) ];
  }

  shuffle( array: any[] ): void {
    const shuffled = this.getShuffled( array );
    shuffled.forEach( (v, i) => array[i] = v );
  }

  getShuffled( array: any[] ): any[] {
    return array
        .map( e => [e, Math.random()] )
        .sort( (x, y) => x[1] - y[1] )
        .map( pair => pair[0] );
  }

  permutation( n: number ): number[] {
    const ar = new Array<number>(n);
    for ( let i = 0; i < n; ++i ) { ar[i] = i; }
    return this.getShuffled( ar );
  }



  /* array */
  isEmpty( ar: any[] ): boolean {
    return ar.length === 0;
  }

  back<T>( ar: Array<T> ): T {
    return ar[ ar.length - 1 ];
  }

  front<T>( ar: Array<T> ): T {
    return ar[0];
  }

  remove<T>( ar: Array<T>, value: T ): T|undefined {
    return this.removeIf( ar, e => e === value );
  }

  removeValue<T>( ar: Array<T>, value: T ): T|undefined {
    return this.removeIf( ar, e => e === value );
  }

  removeIf<T>( ar: Array<T>, f: (T) => boolean ): T {
    return this.removeAt( ar, ar.findIndex(f) );
  }

  /**
   * @description alias of `ar.splice( index, 1 )[0]`;  Delete the element at address `index`
   * @return the deleted element
   */
  removeAt<T>( ar: Array<T>, index: number ): T {
    if ( index < 0 ) return undefined;
    return ar.splice( index, 1 )[0];
  }

  removedCopy<T>( ar: Array<T>, target: T ): Array<T> {
    return ar.filter( e => e !== target );
  }

  append( ar1: any[], ar2: any[] ): any[] {
    return [].concat( ar1, ar2 );
  }


  // let a = [ 1,2,3,[1,2,3],5 ];
  // let b = this.utils.makeShallowCopy(a);
  // a[2] = 999;
  // a[3][1] = 9999;
  copy<T>( ar: Array<T> ): Array<T> {
    return [].concat( ar );
  }

  shallowCopy( obj, asArray?: boolean ) {
    if ( asArray ) return Object.assign([], obj);
    return Object.assign({}, obj);
  }

  filterRemove<T>( array: Array<T>, f: (T) => boolean ): [ Array<T>, Array<T> ] {
    const rest = array.filter( (e) => !f(e) );
    return [ array.filter(f), rest ];
  }

  // copy and return unique array
  // 要素の値を定義する関数（この値の同値性でuniqをかける
  /**
   * @desc copy and return unique array
   * @param ar target array
   * @param f comparison function
   */
  uniq<T>( ar: Array<T>, f: (T) => any = ( (e) => e ) ) {
    return ar.map( (e) => [ e, f(e) ] )
        .filter( (val, index, array ) => (array.map( a => a[1] ).indexOf( val[1] ) === index) )
        .map( a => a[0] );
  }

  sortNumeric( array: any[] ): any[] {
    return array.sort( (a, b) => ( parseFloat(a) - parseFloat(b) ) );
  }

  sum( array: number[] ): number {
    return array.reduce( (prev, curr) => prev + curr );
  }

  average( array: number[] ): number {
    if ( this.isEmpty(array) ) return 0;
    return this.sum( array ) / array.length;
  }

  swap( array: any[], index1: number, index2: number ): void {
    const temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
  }

  isSubset<T>( array1: T[], array2: T[] ): boolean {
    return array1.every( e => array2.includes(e) );
  }

  setIntersection<T>( array1: T[], array2: T[] ): T[] {
    return array1.filter( e => array2.includes(e) );
  }

  setDifference( sortedArray1: number[], sortedArray2: number[] ): number[] {
    const result: number[] = [];
    let it1 = 0;  // iterator for sortedArray1
    let it2 = 0;  // iterator for sortedArray2
    let val1 = sortedArray1[it1];
    let val2 = sortedArray2[it2];
    while ( it1 < sortedArray1.length && it2 < sortedArray2.length ) {
      if ( val1 === val2 ) {
        val1 = sortedArray1[++it1];
        val2 = sortedArray2[++it2];
      } else if ( val1 < val2 ) {
        result.push(val1);
        val1 = sortedArray1[++it1];
      } else {
        val2 = sortedArray2[++it2];
      }
    }
    for ( ; it1 < sortedArray1.length; ++it1 ) {
      result.push( sortedArray1[it1] );
    }
    return result;
  }

  /**
   * @description return minimum element of given Array<number>
   */
  minOfArray( arr: Array<number> ): number {
    let min = Infinity;
    const QUANTUM = 32768;

    for (let i = 0, len = arr.length; i < len; i += QUANTUM) {
      const submin = Math.min.apply(null, arr.slice(i, Math.min(i + QUANTUM, len)));
      min = Math.min(submin, min);
    }
    return min;
  }

  /**
   * @description return maximum element of given Array<number>
   */
  maxOfArray( arr: Array<number> ): number {
    let max = -Infinity;
    const QUANTUM = 32768;

    for ( let i = 0, len = arr.length; i < len; i += QUANTUM ) {
      const submax = Math.max.apply(null, arr.slice(i, Math.max(i + QUANTUM, len)));
      max = Math.max(submax, max);
    }
    return max;
  }

  /**
   * @description (0, 5) => [0,1,2,3,4], (2,12,3) => [2,5,8,11]
   * @param start start number
   * @param length array length
   * @param step step number (default = 1)
   * @return the number sequence array
   */
  seq0( length: number, step: number = 1 ): number[] {
    return this.numberSequence( 0, length, step );
  }
  numSeq( start: number, length: number, step: number = 1 ): number[] {
    return this.numberSequence( start, length, step );
  }
  numberSequence( start: number, length: number, step: number = 1 ): number[] {
    return Array.from( new Array(length) ).map( (_, i) => i * step + start );
  }



  /* async */

  sleep( sec: number ): Promise<any> {
    return new Promise( resolve => setTimeout( resolve, sec * 1000 ) );
  }

  async asyncFilter( array: any[], asyncFunction: Function ) {
    const result = await Promise.all( array.map( e => asyncFunction(e) ) );
    return array.filter( (_, i) => result[i] );
  }
}

