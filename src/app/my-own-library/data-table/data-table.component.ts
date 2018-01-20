import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Observable      } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';

import { UtilitiesService } from '../utilities.service';

import { ResetButtonComponent } from './reset-button.component';
import { ItemsPerPageComponent } from './items-per-page.component';
import { PagenationComponent, getDataAtPage } from './pagenation/pagenation.component';



export class ColumnSetting {
  name:            string  = '';
  headerTitle:     string  = '';
  align?:          'l'|'c'|'r'  = 'c';
  isButton?:       boolean = false;
  manip?:          ''|'input'|'select'|'multiSelect-and'|'multiSelect-or' = '';
  selectOptions$?: Observable<{ value: any, viewValue: string }[]>;  // select, multiSelect-and
  manipState?:     any;
}




@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: [ './data-table.component.css' ]
})
export class DataTableComponent implements OnInit, OnDestroy {
  private alive: boolean = true;
  ready: boolean = false;

  @Input() private data$: Observable<any[]>;
  private data: Object[] = [];

  private filteredData$: Observable<any[]>;
  filteredDataLength: number;
  @Output() filteredDataOnChange = new EventEmitter<any[]>();

  @Input() columnSettings: ColumnSetting[] = [];
  private columnSettingsChange = new EventEmitter<void>();


  // pagenation
  @Input() itemsPerPageOptions: number[];

  @Input() private itemsPerPage: number = 100;
  itemsPerPageSource = new BehaviorSubject<number>( 100 );
  selectedPageIndexSource = new BehaviorSubject<number>(0);

  pagenatedData$: Observable<any[]>;

  @Input() transform = ((columnName: string, value) => value);  // transform cell data at printing
  transformedPagenatedData: any[] = [];

  @Output() onClick = new EventEmitter<{
      rowIndex: number,
      rowIndexFiltered: number,
      columnName: string
    }>();




  constructor(
    private utils: UtilitiesService,
    private resetButton: ResetButtonComponent
  ) {
  }

  ngOnInit() {
    this.itemsPerPageSource.next( this.itemsPerPage );

    /* initialize */
    this.columnSettings.forEach( column => {
      switch (column.manip) {
        case 'select' :
          column.selectOptions$
            = this.data$.map( data => {
                const columnData = data.map( line => line[ column.name ] );
                const values = this.utils.uniq( columnData ).sort();
                return values.map( e => ({ value: e, viewValue: this.transform( column.name, e ) }) );
              });
          break;

        case 'multiSelect-or' :
        case 'multiSelect-and' :
          column.selectOptions$
            = this.data$.map( data => {
                const columnData = data.map( line => line[ column.name ] );
                const values = this.utils.uniq( [].concat( ...columnData ) ).sort();
                return values.map( e => ({ value: e, viewValue: this.transform( column.name, e ) }));
              });
          break;

        default:
          break;
      }
    });

    this.filteredData$
      = Observable.combineLatest(
            this.data$,
            this.columnSettingsChange.asObservable().debounceTime( 300 /* ms */ ),
            data => data.filter( line => this.filterFunction( line ) ) );

    this.pagenatedData$
      = Observable.combineLatest(
            this.filteredData$,
            this.itemsPerPageSource.asObservable(),
            this.selectedPageIndexSource.asObservable(),
            (filteredData, itemsPerPage, selectedPageIndex) =>
              getDataAtPage(
                  filteredData,
                  itemsPerPage,
                  selectedPageIndex ) );

    const transformedPagenatedData$
      = this.pagenatedData$.map( data => data.map( line => {
          const transformed = {};
          Object.keys( line ).forEach( key => {
            if ( Array.isArray(line[key]) ) {
              transformed[key] = line[key].map( e => this.transform( key, e ) ).join(', ');
            } else {
              transformed[key] = this.transform( key, line[key] );
            }
          });
          return transformed;
        }) );


    /* subscriptions */
    this.data$.first()
      .subscribe( data => {
        this.data = data;
        this.columnSettingsChange.emit();  // 最初に1回
        this.ready = true;
      });

    transformedPagenatedData$
      .takeWhile( () => this.alive )
      .subscribe( val => this.transformedPagenatedData = val );

    this.filteredData$.map( e => e.length )
      .takeWhile( () => this.alive )
      .subscribe( val => this.filteredDataLength = val );

    this.filteredData$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.selectedPageIndexSource.next(0);
        this.filteredDataOnChange.emit( val );
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }


  /* view */
  itemsPerPageOnChange( value ) {
    this.itemsPerPageSource.next( value );
  }

  selectedPageIndexOnChange( value ) {
    this.selectedPageIndexSource.next( value );
  }

  reset( name?: string ) {
    this.resetButton.resetSelector( this.columnSettings, name );
    this.columnSettingsChange.emit();
  }

  cellClicked( rowIndexOnThisPage: number, columnName: string ) {
    const rowIndexOnFilteredData
       = this.itemsPerPageSource.value * this.selectedPageIndexSource.value + rowIndexOnThisPage;
    this.onClick.emit({
      rowIndex: this.indexOnRawData( rowIndexOnFilteredData ),
      rowIndexFiltered: rowIndexOnFilteredData,
      columnName: columnName
    });
  }


  changeColumnState( columnName: string, value ) {
    const column = this.columnSettings.find( e => e.name === columnName );
    if ( !column ) return;
    column.manipState = value;
    this.columnSettingsChange.emit();
  }


  /* view models */

  private filterFunction( lineOfData: any ): boolean {
    const validSettings = this.columnSettings.filter( column => column.manipState !== undefined );

    for ( const column of validSettings ) {
      /* no mismatches => return true; 1 or more mismatches => return false */
      switch ( column.manip ) {
        case 'input' :
          if ( !this.utils.submatch( lineOfData[ column.name ], column.manipState, true ) ) return false;
          break;

        case 'select' :
          if ( lineOfData[ column.name ] !== column.manipState ) return false;
          break;

        case 'multiSelect-and' :
          if ( !!column.manipState && column.manipState.length > 0 ) {
            const cellValue = lineOfData[ column.name ];
            if ( !this.utils.isSubset( column.manipState, cellValue ) ) return false;
            /* for any e \in column.manipState, e \in cellValue */
          }
          break;

        case 'multiSelect-or' :
          /* column.manipStateの初期状態はundefinedなのでfilteringされなくなっており，
             column.manipStateの全選択初期化は不要になっている */
          if ( !!column.manipState && column.manipState.length > 0 ) {
            const cellValue = lineOfData[ column.name ];
            if ( this.utils.setIntersection( column.manipState, cellValue ).length === 0 ) return false;
            /* for some e \in column.manipState, e \in cellValue */
          }
          break;

        default :
          break;
      }
    }
    return true;
  }


  private indexOnRawData( indexOnFilteredData: number ): number {
    let filteredDataNum = 0;
    for ( let i = 0; i < this.data.length; ++i ) {
      if ( this.filterFunction( this.data[i] ) ) filteredDataNum++;
      if ( filteredDataNum > indexOnFilteredData ) return i;
    }
    return this.data.length - 1;
  }


}
