import { Observable } from 'rxjs/Observable';

export class ColumnState {
  name:            string  = '';
  headerTitle:     string  = '';
  align?:          'l'|'c'|'r'  = 'c';
  isButton?:       boolean = false;
  manip?:          ''|'input'|'select'|'multiSelect-and'|'multiSelect-or' = '';
  selectOptions$?: Observable<{ value: any, viewValue: string }[]>;  // select, multiSelect-and
  selectOptions?:  { value: any, viewValue: string }[] = [];  // select, multiSelect-and
  manipState?:     any;
}
