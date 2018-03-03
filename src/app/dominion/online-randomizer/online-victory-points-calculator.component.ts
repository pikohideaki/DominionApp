import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { MyRandomizerGroupService      } from './my-randomizer-group.service';
import { MyUserInfoService             } from '../../firebase-mediator/my-user-info.service';

import { SelectedCards } from '../../classes/selected-cards';
import { NumberOfVictoryCards } from '../../classes/number-of-victory-cards';
import { PlayerResult } from '../../classes/online-randomizer/player-result';


@Component({
  selector: 'app-online-victory-points-calculator',
  template: `
    <ng-container *ngIf="(uid$ | async) as uid">
      <div class="body-with-padding">
        <app-victory-points-calculator *ngIf="!!uid"
          [selectedCards$]="selectedCards$"
          [resetVPCalculator$]="resetVPCalculator$"
          [numberOfVictoryCards$]="numberOfVictoryCards$"
          (numberOfVictoryCardsChange)="numberOfVictoryCardsOnChange( $event, uid )"
          (VPtotalChange)="VPtotalOnChange( $event, uid )">
        </app-victory-points-calculator>
      </div>
    </ng-container>
  `,
  styles: [],
})
export class OnlineVictoryPointsCalculatorComponent implements OnInit {

  selectedCards$ = this.myRandomizerGroup.selectedCards$;  // 存在するもののみ表示
  resetVPCalculator$ = this.myRandomizerGroup.resetVPCalculator$;
  uid$: Observable<string> = this.myUserInfo.uid$;
  numberOfVictoryCards$
    = Observable.combineLatest(
        this.myRandomizerGroup.newGameResult.players$,
        this.uid$.filter( uid => !!uid ),
        (players, uid) => ( players.find( e => e.uid === uid ) || new PlayerResult() )
                            .numberOfVictoryCards );


  constructor(
    private myUserInfo: MyUserInfoService,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
  }

  ngOnInit() {
  }

  VPtotalOnChange( VPtotal: number, uid: string ) {
    if ( !uid ) return;
    this.myRandomizerGroup.setNGRPlayerVP( uid, VPtotal );
  }

  numberOfVictoryCardsOnChange(
    numberOfVictoryCards: NumberOfVictoryCards,
    uid: string
  ) {
    if ( !uid ) return;
    this.myRandomizerGroup.setNGRPlayerNumberOfVictoryCards(
        uid, numberOfVictoryCards );
  }
}
