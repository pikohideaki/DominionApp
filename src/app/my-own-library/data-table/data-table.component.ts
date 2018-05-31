import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';

import { utils } from '../utilities';

import { ItemsPerPageComponent } from './items-per-page.component';
import { PagenationComponent, getDataAtPage } from './pagenation/pagenation.component';
import { ColumnState } from './column-state'



@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: [ './data-table.component.css' ]
})
export class DataTableComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() usePagenation: boolean = true;

  @Input() data$: Observable<any[]>;

  private filteredData$: Observable<any[]>;
  private filteredIndice$: Observable<number[]>;
  filteredDataLength$: Observable<number>;
  @Output() filteredDataOnChange = new EventEmitter<any[]>();
  @Output() filteredIndiceOnChange = new EventEmitter<number[]>();

  @Input() private columnStates: ColumnState[] = [];  // initializer
  private columnStatesSource = new BehaviorSubject<ColumnState[]>([]);
  columnStates$ = this.columnStatesSource.asObservable().debounceTime( 300 /* ms */ );


  // pagenation
  @Input() itemsPerPageOptions: number[] = [];

  @Input() itemsPerPageInit: number = 100;
  private itemsPerPageSource = new BehaviorSubject<number>( 100 );
  itemsPerPage$ = this.itemsPerPageSource.asObservable();

  private selectedPageIndexSource = new BehaviorSubject<number>(0);
  selectedPageIndex$ = this.selectedPageIndexSource.asObservable();

  private pagenatedData$: Observable<any[]>;

  @Input() transform = ((columnName: string, value) => value);  // transform cell data at printing
  transformedPagenatedData$: Observable<any[]>;

  @Output() onClick = new EventEmitter<{
      rowIndex: number,
      rowIndexOnFiltered: number,
      columnName: string
    }>();




  constructor( ) { }

  ngOnInit() {
    this.columnStatesSource.next( this.columnStates );  // initialize
    this.itemsPerPageSource.next( this.itemsPerPageInit );  // initialize

    this.filteredIndice$
      = Observable.combineLatest(
            this.data$,
            this.columnStates$,
            (data, columnStates) =>
              data.map( (e, i) => ({ val: e, idx: i }) )
                  .filter( e => this.filterFunction( e.val, columnStates ) )
                  .map( e => e.idx ) );

    this.filteredData$
      = this.filteredIndice$.withLatestFrom(
            this.data$,
            (indice, data) => indice.map( idx => data[idx] ) );

    this.filteredDataLength$ = this.filteredData$.map( e => e.length );

    this.pagenatedData$
      = Observable.combineLatest(
            this.filteredData$,
            this.itemsPerPage$,
            this.selectedPageIndex$,
            (filteredData, itemsPerPage, selectedPageIndex) =>
              getDataAtPage(
                  filteredData,
                  itemsPerPage,
                  selectedPageIndex ) );

    this.transformedPagenatedData$
      = this.pagenatedData$.map( data => data.map( line => {
          const transformed = {};
          Object.keys( line ).forEach( key => {
            if ( Array.isArray( line[key] ) ) {
              transformed[key] = line[key].map( e => this.transform( key, e ) ).join(', ');
            } else {
              transformed[key] = this.transform( key, line[key] );
            }
          });
          return transformed;
        }) );


    /* subscriptions */
    this.filteredIndice$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.selectedPageIndexSource.next(0);
        this.filteredIndiceOnChange.emit( val );
      });

    this.filteredData$
      .takeWhile( () => this.alive )
      .subscribe( val => this.filteredDataOnChange.emit( val ) );

    this.filteredData$.withLatestFrom( this.data$ )
      .takeWhile( () => this.alive )
      .subscribe( ([filteredData, data]) => {
        const columnStates = this.columnStatesSource.getValue();
        columnStates.forEach( column => {
          const dataOfColumn         = data        .map( line => line[ column.name ] );
          const dataOfColumnFiltered = filteredData.map( line => line[ column.name ] );
          switch ( column.manip ) {
            case 'select' : {
              const options = utils.array.uniq( dataOfColumn ).sort();
              column.selectOptions
                = options.map( e => ({
                      value: e,
                      viewValue: this.transform( column.name, e )
                          + `(${dataOfColumnFiltered.filter( cell => cell === e ).length})`,
                    }) );
            } break;
            case 'multiSelect-or' :
            case 'multiSelect-and' : {
              const options = utils.array.uniq( [].concat( ...dataOfColumn ) ).sort();
              column.selectOptions
                = options.map( e => ({
                      value: e,
                      viewValue: this.transform( column.name, e )
                          + `(${dataOfColumnFiltered.filter( cell => cell.includes(e) ).length})`,
                    }) );
            } break;
            default: break;
          }
        });
        this.columnStatesSource.next( columnStates );
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }



  itemsPerPageOnChange( value ) {
    this.itemsPerPageSource.next( value );
    this.selectedPageIndexSource.next(0);
  }

  selectedPageIndexOnChange( value ) {
    this.selectedPageIndexSource.next( value );
  }

  cellClicked(
    rawData,
    rowIndexOnThisPage: number,
    columnName: string,
    columnStates: ColumnState[]
  ) {
    const rowIndexOnFilteredData
       = this.itemsPerPageSource.value * this.selectedPageIndexSource.value + rowIndexOnThisPage;
    this.onClick.emit({
      rowIndex: this.indexOnRawData( rawData, rowIndexOnFilteredData, columnStates ),
      rowIndexOnFiltered: rowIndexOnFilteredData,
      columnName: columnName
    });
  }


  changeColumnState( columnName: string, value ) {
    const columnStates = this.columnStatesSource.getValue();
    const column = columnStates.find( e => e.name === columnName );
    if ( column === undefined ) return;
    column.manipState = value;
    this.columnStatesSource.next( columnStates );
  }

  reset( columnName: string ) {
    this.changeColumnState( columnName, undefined );
  }

  resetAll() {
    const columnStates = this.columnStatesSource.getValue();
    columnStates.forEach( e => e.manipState = undefined );
    this.columnStatesSource.next( columnStates );
  }


  private filterFunction( lineOfData: any, columnStates: ColumnState[] ): boolean {
    const validSettings = columnStates.filter( column => column.manipState !== undefined );

    for ( const column of validSettings ) {
      /* no mismatches => return true; 1 or more mismatches => return false */
      switch ( column.manip ) {
        case 'input' :
          if ( !utils.string.submatch( lineOfData[ column.name ], column.manipState, true ) ) return false;
          break;

        case 'select' :
          if ( lineOfData[ column.name ] !== column.manipState ) return false;
          break;

        case 'multiSelect-and' :
          if ( !!column.manipState && column.manipState.length > 0 ) {
            const cellValue = lineOfData[ column.name ];
            if ( !utils.array.isSubset( column.manipState, cellValue ) ) return false;
            /* for any e \in column.manipState, e \in cellValue */
          }
          break;

        case 'multiSelect-or' :
          /* column.manipStateの初期状態はundefinedなのでfilteringされなくなっており，
             column.manipStateの全選択初期化は不要になっている */
          if ( !!column.manipState && column.manipState.length > 0 ) {
            const cellValue = lineOfData[ column.name ];
            if ( utils.array.setIntersection( column.manipState, cellValue ).length === 0 ) return false;
            /* for some e \in column.manipState, e \in cellValue */
          }
          break;

        default :
          break;
      }
    }
    return true;
  }


  private indexOnRawData( rawData, indexOnFilteredData: number, columnStates: ColumnState[] ): number {
    for ( let i = 0, filteredDataNum = 0; i < rawData.length; ++i ) {
      if ( this.filterFunction( rawData[i], columnStates ) ) filteredDataNum++;
      if ( filteredDataNum > indexOnFilteredData ) return i;
    }
    return rawData.length - 1;
  }
}
