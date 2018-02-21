import { Injectable } from '@angular/core';

import * as screenfull from 'screenfull';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class FullScreenService {

  private isFullscreenSource = new BehaviorSubject<boolean>(false);
  isFullscreen$ = this.isFullscreenSource.asObservable();


  constructor() {
    screenfull.onchange( () =>
      this.isFullscreenSource.next( screenfull.isFullscreen ) );
  }


}
