import { Injectable } from '@angular/core';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class GameConfigService {

  cardSizeAutoChange$ = this.user.onlineGame.cardSizeAutoChange$;
  cardSizeRatio$      = this.user.onlineGame.cardSizeRatio$;
  messageSpeed$       = this.user.onlineGame.messageSpeed$;
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

  setMessageSpeed( value: number ) {
    this.user.setOnlineGameMessageSpeed( value );
  }

  setDevMode( value: boolean ) {
    this.devModeSource.next( value );
  }
}
