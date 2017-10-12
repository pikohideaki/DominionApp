import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DominionCardImageComponent    } from '../sub-components/dominion-card-image/dominion-card-image.component';
import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { MyRandomizerGroupService      } from './my-randomizer-group.service';
import { MyUserInfoService             } from '../../firebase-mediator/my-user-info.service';

import { CardProperty  } from '../../classes/card-property';
import { SelectedCards } from '../../classes/selected-cards';
import { User          } from '../../classes/user';


@Component({
  selector: 'app-online-victory-points-calculator',
  template: `
    <div class="bodyWithPadding">
      <app-victory-points-calculator *ngIf="!!uid"
        [selectedCards$]="selectedCards$"
        [resetVPCalculator$]="resetVPCalculator$"
        (VPtotalChange)="VPtotalOnChange( $event )">
      </app-victory-points-calculator>
    </div>
  `,
  styles: [],
})
export class OnlineVictoryPointsCalculatorComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  selectedCards$: Observable<SelectedCards>;  // 存在するもののみ表示
  resetVPCalculator$: Observable<number>;

  uid: string = '';



  constructor(
    private myUserInfo: MyUserInfoService,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    this.selectedCards$ = this.myRandomizerGroup.selectedCards$;

    this.resetVPCalculator$ = this.myRandomizerGroup.resetVPCalculator$;

    this.myUserInfo.uid$
      .takeWhile( () => this.alive )
      .subscribe( val => this.uid = val );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  VPtotalOnChange( VPtotal: number ) {
    if ( !this.uid ) return;
    this.myRandomizerGroup.setNewGameResultPlayerVP( this.uid, VPtotal );
  }

}
