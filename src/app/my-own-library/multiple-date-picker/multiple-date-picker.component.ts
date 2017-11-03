import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { UtilitiesService } from '../utilities.service';


@Component({
  selector: 'app-multiple-date-picker',
  templateUrl: './multiple-date-picker.component.html',
  styleUrls: ['./multiple-date-picker.component.css']
})
export class MultipleDatePickerComponent implements OnInit, OnDestroy {
  private alive = true;

  @Input() width: number = 300;
  @Input() filterFunction = (e => true);
  @Input() dayLabelLanguage: 'eng'|'jp' = 'eng';
  @Input() initialDateList$: Observable<Date[]>;

  dayStrings: string[];
  weeks: {date: Date, selected: boolean}[][] = [];

  private currentYearSource  = new BehaviorSubject<number>( (new Date()).getFullYear() );
  private currentMonthSource = new BehaviorSubject<number>( (new Date()).getMonth() );
  currentYear:  number;
  currentMonth: number;

  private selectedDateValuesSource = new BehaviorSubject<number[]>([]);
  @Output() selectedDatesChange = new EventEmitter<Date[]>();


  constructor(
    private utils: UtilitiesService
  ) {
    const currentYear$  = this.currentYearSource .asObservable();
    const currentMonth$ = this.currentMonthSource.asObservable();
    const weeks$: Observable<{date: Date, selected: boolean}[][]>
      = Observable.combineLatest(
        currentYear$,
        currentMonth$,
        this.selectedDateValuesSource.asObservable(),
        (year, month, selectedDates) => {
          const weeks: { date: Date, selected: boolean }[][] = [];
          this.utils.getAllDatesIn( year, month ).forEach( date => {
            const weekNumber = this.utils.weekNumber( date );
            if ( weeks.length < weekNumber + 1 ) {
              weeks.push( Array(7).fill({ date: undefined, selected: false }) );
            }
            weeks[ weekNumber ][ date.getDay() ] = {
              date     : date,
              selected : selectedDates.includes( date.valueOf() ),
            };
          });
          return weeks;
        }
    );

    const selectedDates$
      = this.selectedDateValuesSource.asObservable()
            .map( list => list.map( e => new Date(e) )
                              .sort( (a, b) => this.utils.compareDates(a, b) ) );

    currentYear$
      .takeWhile( () => this.alive )
      .subscribe( val => this.currentYear = val );

    currentMonth$
      .takeWhile( () => this.alive )
      .subscribe( val => this.currentMonth = val );

    weeks$
      .takeWhile( () => this.alive )
      .subscribe( val => this.weeks = val );

    selectedDates$
      .takeWhile( () => this.alive )
      .subscribe( val => this.selectedDatesChange.emit( val ) );
  }

  ngOnInit() {
    switch ( this.dayLabelLanguage ) {
      case 'jp' :
        this.dayStrings = ['日', '月', '火', '水', '木', '金', '土'];
        break;

      case 'eng' :
        this.dayStrings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];
        break;
    }

    this.initialDateList$.subscribe( initialDateList => {
      const initialDateValuesUniq
        = this.utils.uniq(
            initialDateList
              .map( e => this.utils.getMidnightOfDate(e) )
              .map( e => e.valueOf() ) );
      this.selectedDateValuesSource.next( initialDateValuesUniq );
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }


  goToPreviousMonth() {
    if ( this.currentMonthSource.value > 0 ) {
      this.currentMonthSource.next( this.currentMonthSource.value - 1 );
    } else {
      this.currentMonthSource.next( 11 );
      this.currentYearSource.next( this.currentYearSource.value - 1 );
    }
  }

  goToNextMonth() {
    if ( this.currentMonthSource.value < 11 ) {
      this.currentMonthSource.next( this.currentMonthSource.value + 1 );
    } else {
      this.currentMonthSource.next( 0 );
      this.currentYearSource.next( this.currentYearSource.value + 1 );
    }
  }

  goToToday() {
    this.currentMonthSource.next( (new Date()).getMonth() );
    this.currentYearSource .next( (new Date()).getFullYear() );
  }

  isToday( date: Date ) {
    if ( !date ) return false;
    return this.utils.isToday( date );
  }


  resetSelections() {
    this.selectedDateValuesSource.next([]);
  }

  dateOnSelectToggle( date: Date ) {
    if ( !date ) return;
    if ( !this.filterFunction( date ) ) return;
    const current = this.selectedDateValuesSource.value;
    if ( current.includes( date.valueOf() ) ) {
      this.utils.removeValue( current, date.valueOf() );
    } else {
      current.push( date.valueOf() );
    }
    this.selectedDateValuesSource.next( current );
  }

  selectToggleDayColumn( dayIndex: number ) {
    const current = this.selectedDateValuesSource.value;
    const month = this.currentMonthSource.value;
    const year  = this.currentYearSource.value;

    const datesInColumn
      = this.utils.getAllDatesIn( year, month )
            .filter( date => date.getDay() === dayIndex )
            .filter( this.filterFunction );
    const datesInColumnAllSelected
      = datesInColumn.every( e => current.includes( e.valueOf() ) );

    datesInColumn.forEach( date => this.utils.remove( current, date.valueOf() ) );
    if ( !datesInColumnAllSelected ) {
      datesInColumn.forEach( date => current.push( date.valueOf() ) );
    }
    this.selectedDateValuesSource.next( current );
  }
}
