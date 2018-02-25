import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';


@Injectable()
export class GameConfigService {

  cardSizeAutoChange$   = this.user.onlineGame.cardSizeAutoChange$;
  cardSizeRatio$        = this.user.onlineGame.cardSizeRatio$;
  messageMillisec$      = this.user.onlineGame.messageMillisec$;
  autoSort$             = this.user.onlineGame.autoSort$;

  private devModeSource = new BehaviorSubject<boolean>(false);
  devMode$ = this.devModeSource.asObservable();



  constructor(
    private user: MyUserInfoService
  ) { }

  setCardSizeAutoChange( value: boolean ) {
    this.user.setOnlineGameCardSizeAutoChange( value );
  }

  setCardSizeRatio( value: number ) {
    this.user.setOnlineGameCardSizeRatio( value );
  }

  setMessageMillisec( millisec: number ) {
    this.user.setOnlineGameMessageMillisec( millisec );
  }

  setDevMode( value: boolean ) {
    this.devModeSource.next( value );
  }

  setAutoSort( value: boolean ) {
    this.user.setOnlineGameAutoSort( value );
  }

}
