import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/concatMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';


@Injectable()
export class GameMessageService {

  private messageMillisec$ = this.myUserInfo.onlineGame.messageMillisec$;

  private messageForMeSource = new BehaviorSubject<string>('');
  private messageForMe$ = this.messageForMeSource.asObservable();

  private messageForMeList = [];
  messageForMeList$
    = this.messageForMe$.map( _ => this.messageForMeList );

  messageForMeWithTime$: Observable<string>
    = this.messageForMe$
        .withLatestFrom( this.messageMillisec$ )
        .concatMap( ([x, messageMillisec]) =>
            Observable.merge(
                Observable.of(x),
                Observable.of('').delay(messageMillisec) ) );


  constructor(
    private myUserInfo: MyUserInfoService
  ) {
  }


  pushMessage( message: string ) {
    this.messageForMeList.push( message );
    this.messageForMeSource.next( message );
  }
}
