import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/startWith';

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
  @Output() selectedDatesChange = new EventEmitter<Date[]>();

  dayStrings: string[];
  weeks$: Observable<{ date: Date, selected: boolean }[][]>;

  private currentYearSource  = new BehaviorSubject<number>( (new Date()).getFullYear() );
  private currentMonthSource = new BehaviorSubject<number>( (new Date()).getMonth() );
  currentYear$:  Observable<number> = this.currentYearSource .asObservable();
  currentMonth$: Observable<number> = this.currentMonthSource.asObservable();

  private selectedDateValuesSource = new BehaviorSubject<number[]>([]);
  private selectedDateValues$ = this.selectedDateValuesSource.asObservable().startWith([]);



  constructor(
    private utils: UtilitiesService
  ) {
    this.weeks$ = Observable.combineLatest(
        this.currentYear$,
        this.currentMonth$,
        this.selectedDateValues$,
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
        } );

    this.selectedDateValues$
      .map( list => list.map( e => new Date(e) )
                        .sort( (a, b) => this.utils.compareDates(a, b) ) )
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

    if ( !!this.initialDateList$ ) {
      this.initialDateList$.first().subscribe( initialDateList => {
        const initialDateValuesUniq
          = this.utils.uniq(
              initialDateList
                .map( e => this.utils.getMidnightOfDate(e) )
                .map( e => e.valueOf() ) );
        this.selectedDateValuesSource.next( initialDateValuesUniq );
      });
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }


  goToPreviousMonth() {
    if ( this.currentMonthSource.getValue() > 0 ) {
      this.currentMonthSource.next( this.currentMonthSource.getValue() - 1 );
    } else {
      this.currentMonthSource.next( 11 );
      this.currentYearSource.next( this.currentYearSource.getValue() - 1 );
    }
  }

  goToNextMonth() {
    if ( this.currentMonthSource.getValue() < 11 ) {
      this.currentMonthSource.next( this.currentMonthSource.getValue() + 1 );
    } else {
      this.currentMonthSource.next( 0 );
      this.currentYearSource.next( this.currentYearSource.getValue() + 1 );
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
    const current = this.selectedDateValuesSource.getValue();
    if ( current.includes( date.valueOf() ) ) {
      this.utils.removeValue( current, date.valueOf() );
    } else {
      current.push( date.valueOf() );
    }
    this.selectedDateValuesSource.next( current );
  }

  selectToggleDayColumn( dayIndex: number ) {
    const current = this.selectedDateValuesSource.getValue();
    const month = this.currentMonthSource.getValue();
    const year  = this.currentYearSource.getValue();

    const datesOfDayColumn
      = this.utils.getAllDatesIn( year, month )
            .filter( date => date.getDay() === dayIndex )
            .filter( this.filterFunction );
    const datesInColumnAllSelected
      = datesOfDayColumn.every( e => current.includes( e.valueOf() ) );

    datesOfDayColumn.forEach( date => this.utils.remove( current, date.valueOf() ) );
    if ( !datesInColumnAllSelected ) {
      datesOfDayColumn.forEach( date => current.push( date.valueOf() ) );
    }
    this.selectedDateValuesSource.next( current );
  }
}
