
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



/* functions */

export const utils = {


  localStorage: {
    set: ( key: string, value: any ) =>
      localStorage.setItem( key, JSON.stringify( value ) ),

    get: ( key: string ) =>
      JSON.parse( localStorage.getItem( key ) ),

    has: ( key: string ): boolean =>
      ( localStorage.getItem( key ) != null ),
  },


  string: {
    submatch: ( target: string, key: string, ignoreCase: boolean = false ): boolean =>
      ( ignoreCase
        ? utils.string.submatch( target.toUpperCase(), key.toUpperCase() )
        : (target.indexOf( key ) !== -1) ),

    getAlphabets: ( charCase: 'upper'|'lower' ) => {
      const code_a = 'a'.charCodeAt(0);
      const code_A = 'A'.charCodeAt(0);
      const code = ( charCase === 'upper' ? code_A : code_a );
      return utils.number.seq0(26).map( i => String.fromCharCode( code + i ) );
    },
  },


  object: {
    keysAsNumber: ( obj: Object ): number[] =>
      Object.keys( obj || {} ).map( e => Number(e) ),

    forEach: ( obj: Object, f: (element: any, key?: string, object?: any) => any ) =>
      Object.keys( obj || {} ).forEach( key => f( obj[key], key, obj ) ),

    map: ( obj: Object, f: (element: any, key?: string, object?: any) => any ) =>
      Object.keys( obj || {} ).map( key => f( obj[key], key, obj ) ),

    entries: ( obj: Object ) => utils.object.map( obj, e => e ),

    copy: ( obj: Object ) => JSON.parse( JSON.stringify( obj || {} ) ),

    compareByJsonString: ( obj1: Object, obj2: Object ) =>
      JSON.stringify(obj1) === JSON.stringify(obj2),

    shallowCopy: ( obj: Object, asArray?: boolean ) =>
      ( asArray ? Object.assign([], obj) : Object.assign({}, obj) ),

  },


  array: {
    isEmpty: ( ar: any[] ): boolean => ar.length === 0,
    back:  <T>( ar: Array<T> ): T => ar[ ar.length - 1 ],
    front: <T>( ar: Array<T> ): T => ar[0],

    isEqual: <T>( ar1: T[], ar2: T[] ): boolean => {
      if ( ar1.length !== ar2.length ) return false;
      for ( let i = 0; i < ar1.length; ++i ) {
        if ( ar1[i] !== ar2[i] ) return false;
      }
      return true;
    },

    /**
     * @description alias of `ar.splice( index, 1 )[0]`;  Delete the element at address `index`
     * @return the deleted element
     */
    removeAt: <T>( arr: Array<T>, index: number ): T =>
      ( index < 0 ? undefined : arr.splice( index, 1 )[0] ),

    removeIf: <T>( arr: Array<T>, f: (T) => boolean ): T =>
      utils.array.removeAt( arr, arr.findIndex(f) ),

    remove: <T>( arr: Array<T>, value: T ): T|undefined =>
      utils.array.removeIf( arr, e => e === value ),

    removeValue: <T>( arr: Array<T>, value: T ): T|undefined =>
      utils.array.removeIf( arr, e => e === value ),

    getRemovedCopy: <T>( arr: Array<T>, target: T ): Array<T> =>
      arr.filter( e => e !== target ),

    filterRemove: <T>( arr: Array<T>, f: (T) => boolean ): [ Array<T>, Array<T> ] =>
      [ arr.filter(f), arr.filter( e => !f(e) ) ],

    append: ( arr1: any[], arr2: any[] ): any[] => [].concat( arr1, arr2 ),

    copy: <T>( arr: Array<T> ): Array<T> => [].concat( arr ),

    getReversed: ( arr: any[] ) => utils.array.copy( arr ).reverse(),

    getSortedByKey: ( arr: any[], key: string ) =>
      utils.array.copy( arr ).sort( (x, y) => x[key] - y[key] ),

    /**
     * @desc copy and return unique array
     * @param arr target array
     * @param mapFunction perform identity check after mapping by the map function
     */
    uniq: <T>( arr: Array<T>, mapFunction: (T) => any = (e => e) ) =>
      arr.map( (e) => [ e, mapFunction(e) ] )
         .filter( (val, index, array) => (array.map( a => a[1] ).indexOf( val[1] ) === index) )
         .map( a => a[0] ),

    sortNumeric: ( arr: any[] ): any[] =>
      arr.sort( (a, b) => ( parseFloat(a) - parseFloat(b) ) ),

    sum: ( arr: number[] ): number =>
      arr.reduce( (prev, curr) => prev + curr ),

    average: ( array: number[] ): number =>
      ( utils.array.isEmpty(array) ? 0 : utils.array.sum( array ) / array.length ),

    swap: ( arr: any[], index1: number, index2: number ) => {
      const temp  = arr[index1];
      arr[index1] = arr[index2];
      arr[index2] = temp;
    },

    isSubset: <T>( arr1: T[], arr2: T[] ): boolean =>
      arr1.every( e => arr2.includes(e) ),

    setIntersection: <T>( arr1: T[], arr2: T[] ): T[] =>
      arr1.filter( e => arr2.includes(e) ),

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
    },

    minValue: ( arr: Array<number> ): number => {
      let min = Infinity;
      const QUANTUM = 32768;

      for (let i = 0; i < arr.length; i += QUANTUM) {
        const submin = Math.min( ...arr.slice(i, Math.min(i + QUANTUM, arr.length)) );
        min = Math.min(submin, min);
      }
      return min;
    },

    maxValue: ( arr: Array<number> ): number => {
      let max = -Infinity;
      const QUANTUM = 32768;

      for ( let i = 0; i < arr.length; i += QUANTUM ) {
        const submax = Math.max( ...arr.slice(i, Math.max(i + QUANTUM, arr.length)) );
        max = Math.max(submax, max);
      }
      return max;
    },

    isInArrayRange: ( target: number, array: any[] ): boolean =>
      utils.number.isInRange( target, 0, array.length ),
  },


  number: {
    /**
     * @description (0, 5) => [0,1,2,3,4], (2,12,3) => [2,5,8,11]
     * @param start start number
     * @param length array length
     * @param step step number (default = 1)
     * @return the number sequence array
     */
    numberSequence: ( start: number, length: number, step: number = 1 ): number[] =>
      Array.from( new Array(length) ).map( (_, i) => i * step + start ),

    numSeq: ( start: number, length: number, step: number = 1 ): number[] =>
      utils.number.numberSequence( start, length, step ),

    seq0: ( length: number, step: number = 1 ): number[] =>
      utils.number.numberSequence( 0, length, step ),

    roundAt: ( val: number, precision: number ) => {
      const digit = 10 ** precision;
      return Math.round( val * digit ) / digit;
    },

    integerDivision: ( a: number, b: number ): number =>
      Math.floor( Math.floor(a) / Math.floor(b) ),

    divint: ( a: number, b: number ) =>
      utils.number.integerDivision( a, b ),

    /**
     * @desc isInRange( target, begin, end ) === ( begin <= target && target < end )
     */
    isInRange: ( target: number, begin: number, end: number ): boolean =>
      ( begin <= target && target < end ),

    random: {
      genIntegerIn: ( min: number, max: number ) =>
        Math.round( Math.random() * (max - min) + min ),

      getRandomElement: <T>( array: Array<T> ): T =>
        array[ this.randomNumber( 0, array.length - 1 ) ],

      getShuffled: ( arr: any[] ): any[] =>
        arr.map( e => [e, Math.random()] )
            .sort( (x, y) => x[1] - y[1] )
            .map( pair => pair[0] ),

      shuffle: ( arr: any[] ) => {
        const shuffled = utils.number.random.getShuffled( arr );
        shuffled.forEach( (v, i) => arr[i] = v );
      },

      permutation: ( n: number ): number[] =>
        utils.number.random.getShuffled( utils.number.seq0(n) ),
    },

  },


  date: {
    weekNumber: ( dat: Date ) => {
      const date0Saturday = dat.getDate() - 1 + ( 6 - dat.getDay() );
      return Math.floor( date0Saturday / 7 );
    },

    isToday: ( dat: Date ) => {
      // Get today's date
      const todaysDate = new Date();
      // call setHours to take the time out of the comparison
      return ( dat.setHours(0, 0, 0, 0).valueOf() === todaysDate.setHours(0, 0, 0, 0).valueOf() );
    },

    getAllDatesIn: ( year: number, month: number ): Date[] => {
      const firstDateOfMonth = new Date( year, month, 1, 0, 0, 0, 0 );
      return utils.number.numSeq( 1, 31 )
              .filter( dateNumber => {
                const date = new Date( firstDateOfMonth.setDate( dateNumber ) );
                return date.getMonth() === month;
              })
              .map( dateNumber => new Date( year, month, dateNumber, 0, 0, 0, 0 ) );
    },

    compare: ( date1: Date, date2: Date ): -1|0|1 => {
      if ( date1.getFullYear()     > date2.getFullYear()     ) return  1;
      if ( date1.getFullYear()     < date2.getFullYear()     ) return -1;
      if ( date1.getMonth()        > date2.getMonth()        ) return  1;
      if ( date1.getMonth()        < date2.getMonth()        ) return -1;
      if ( date1.getDate()         > date2.getDate()         ) return  1;
      if ( date1.getDate()         < date2.getDate()         ) return -1;
      if ( date1.getHours()        > date2.getHours()        ) return  1;
      if ( date1.getHours()        < date2.getHours()        ) return -1;
      if ( date1.getMinutes()      > date2.getMinutes()      ) return  1;
      if ( date1.getMinutes()      < date2.getMinutes()      ) return -1;
      if ( date1.getSeconds()      > date2.getSeconds()      ) return  1;
      if ( date1.getSeconds()      < date2.getSeconds()      ) return -1;
      if ( date1.getMilliseconds() > date2.getMilliseconds() ) return  1;
      if ( date1.getMilliseconds() < date2.getMilliseconds() ) return -1;
      return 0;
    },

    getDayStringJp: ( dat: Date ) =>
      ['日', '月', '火', '水', '木', '金', '土'][ dat.getDay() ],

    getDayStringEng: ( dat: Date ) =>
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][ dat.getDay() ],

    toYMD: ( dat: Date, delimiter: string = '/' ): string =>
      dat.getFullYear()
          + delimiter
          + (dat.getMonth() + 1).toString().padStart( 2, '0' )
          + delimiter
          + dat.getDate().toString().padStart( 2, '0' ),

    toHM: ( dat: Date, delimiter: string = ':' ): string =>
      dat.getHours().toString().padStart( 2, '0' )
          + delimiter
          + dat.getMinutes().toString().padStart( 2, '0' ),

    toHMS: ( dat: Date, delimiter: string = ':' ): string =>
      dat.getHours().toString().padStart( 2, '0' )
          + delimiter
          + dat.getMinutes().toString().padStart( 2, '0' )
          + delimiter
          + dat.getSeconds().toString().padStart( 2, '0' ),

    toYMDHMS: ( dat: Date ): string =>
      `${utils.date.toYMD( dat )} ${utils.date.toHMS( dat )}`,

    getYestereday: ( dat: Date ): Date =>
      new Date( ( new Date( dat ) ).setDate( dat.getDate() - 1) ),

    getTomorrow: ( dat: Date ): Date =>
      new Date( ( new Date( dat ) ).setDate( dat.getDate() + 1) ),

    toMidnight: ( date: Date ): Date => {
      const midnight = new Date( date );
      midnight.setHours(0);
      midnight.setMinutes(0);
      midnight.setSeconds(0);
      midnight.setMilliseconds(0);
      return midnight;
    },

  },


  asyncOperation: {
    sleep: ( sec: number ): Promise<any> =>
      new Promise( resolve => setTimeout( resolve, sec * 1000 ) ),

    asyncFilter: async ( array: any[], asyncFunction: Function ) => {
      const result = await Promise.all( array.map( e => asyncFunction(e) ) );
      return array.filter( (_, i) => result[i] );
    },
  }


};
