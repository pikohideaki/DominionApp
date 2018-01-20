import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';

import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';

import { MyRandomizerGroupService } from './my-randomizer-group.service';

import { SelectedCards } from '../../classes/selected-cards';


@Component({
  providers: [ MyRandomizerGroupService ],
  selector: 'app-online-randomizer',
  templateUrl: './online-randomizer.component.html',
  styleUrls: ['./online-randomizer.component.css']
})
export class OnlineRandomizerComponent implements OnInit, OnDestroy {
  private alive = true;

  dataIsready: boolean;
  signedIn: boolean;
  signedInToRandomizerGroup: boolean;
  myRandomizerGroupName: string;
  BlackMarketIsUsed: boolean;


  constructor(
    private myUserInfo: MyUserInfoService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    const signedIn$ = this.myUserInfo.signedIn$;
    const signedInToRandomizerGroup$ = this.myUserInfo.signedInToRandomizerGroup$;
    const myRandomizerGroupName$ = this.myRandomizerGroup.name$;

    const BlackMarketIsUsed$
      = this.myRandomizerGroup.selectedCards$.map( e => e.BlackMarketPile.length > 0 )
          .distinctUntilChanged();

    Observable.combineLatest(
          signedIn$,
          signedInToRandomizerGroup$,
          myRandomizerGroupName$ )
      .first().map( _ => true )
      .startWith( false )
      .takeWhile( () => this.alive )
      .subscribe( val => this.dataIsready = val );

    /* subscriptions */
    signedIn$
      .takeWhile( () => this.alive )
      .subscribe( val => this.signedIn = val );

    signedInToRandomizerGroup$
      .takeWhile( () => this.alive )
      .subscribe( val => this.signedInToRandomizerGroup = val );

    myRandomizerGroupName$
      .takeWhile( () => this.alive )
      .subscribe( val => this.myRandomizerGroupName = val );

    BlackMarketIsUsed$
      .takeWhile( () => this.alive )
      .subscribe( val => this.BlackMarketIsUsed = val );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
