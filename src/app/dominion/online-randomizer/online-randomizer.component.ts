import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';

import { MyRandomizerGroupService } from './my-randomizer-group.service';

import { SelectedCards } from '../../classes/selected-cards';


@Component({
  providers: [ MyRandomizerGroupService ],
  selector: 'app-online-randomizer',
  templateUrl: './online-randomizer.component.html',
  styleUrls: ['./online-randomizer.component.css']
})
export class OnlineRandomizerComponent implements OnInit {
  dataIsready$: Observable<boolean>;
  signedIn$: Observable<boolean>;
  signedInToRandomizerGroup$: Observable<boolean>;
  myRandomizerGroupName$: Observable<string>;
  BlackMarketIsUsed$: Observable<boolean>;


  constructor(
    private myUserInfo: MyUserInfoService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    this.signedIn$ = this.myUserInfo.signedIn$;
    this.signedInToRandomizerGroup$ = this.myUserInfo.signedInToRandomizerGroup$;
    this.myRandomizerGroupName$ = this.myRandomizerGroup.name$;

    this.dataIsready$
      = Observable.combineLatest(
            this.signedIn$,
            this.signedInToRandomizerGroup$,
            this.myRandomizerGroupName$ )
          .first().map( _ => true )
          .startWith( false );

    this.BlackMarketIsUsed$
      = this.myRandomizerGroup.selectedCards$.map( e => e.BlackMarketPile.length > 0 )
          .distinctUntilChanged();
  }

  ngOnInit() {
  }

}
