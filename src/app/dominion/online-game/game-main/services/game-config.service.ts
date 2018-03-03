import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';


@Injectable()
export class GameConfigService {

  cardSizeAutoChange$ = this.user.onlineGame.cardSizeAutoChange$;
  cardSizeRatio$      = this.user.onlineGame.cardSizeRatio$;
  messageSec$         = this.user.onlineGame.messageSec$;
  autoSort$           = this.user.onlineGame.autoSort$;

  private devModeSource = new BehaviorSubject<boolean>(true);
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

  setMessageSec( sec: number ) {
    this.user.setOnlineGameMessageSec( sec );
  }

  setDevMode( value: boolean ) {
    this.devModeSource.next( value );
  }

  setAutoSort( value: boolean ) {
    this.user.setOnlineGameAutoSort( value );
  }

}
