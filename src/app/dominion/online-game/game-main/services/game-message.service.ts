import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/concatMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';


@Injectable()
export class GameMessageService {

  messageSpeed$ = this.myUserInfo.onlineGame.messageSpeed$;

  private messageForMeSource = new BehaviorSubject<string>('');
  messageForMe$: Observable<string>
    = this.messageForMeSource.asObservable()
        .withLatestFrom( this.messageSpeed$ )
        .concatMap( ([x, messageSpeed]) =>
            Observable.merge(
                Observable.of(x),
                Observable.of('').delay(1000 / messageSpeed) ) );


  constructor(
    private myUserInfo: MyUserInfoService
  ) { }


  pushMessage( message: string ) {
    this.messageForMeSource.next( message );
  }
}
