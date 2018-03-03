import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class ValuesForViewService {

  private gainCardStateSource = new BehaviorSubject<boolean>(false);
  gainCardState$: Observable<boolean> = this.gainCardStateSource.asObservable();


  constructor() { }


  setGainCardState( value: boolean ) {
    this.gainCardStateSource.next( value );
  }

}
