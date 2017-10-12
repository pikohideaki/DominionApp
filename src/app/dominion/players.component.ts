import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { UtilitiesService   } from '../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../firebase-mediator/cloud-firestore-mediator.service';
import { User } from '../classes/user';


@Component({
  selector: 'app-players',
  template: `
    <div class="bodyWithPadding">
      <app-data-table *ngIf="dataIsReady$ | async"
          [data]='userNameList$ | async'
          [columnSettings]='columnSettings' >
      </app-data-table>
      <app-waiting-spinner [done]="dataIsReady$ | async"></app-waiting-spinner>
    </div>
  `,
  styles: [],
})
export class PlayersComponent implements OnInit {
  dataIsReady$: Observable<boolean>;
  userNameList$: Observable<{ name: string, name_yomi: string }[]>;

  columnSettings = [
    { name: 'name'     , align: 'l', manip: 'none', button: false, headerTitle: '名前' },
    { name: 'name_yomi', align: 'l', manip: 'none', button: false, headerTitle: '読み' },
  ];



  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService
  ) {
    this.userNameList$
      = this.database.users$
          .map( users => users.map( e => ({ name: e.name, name_yomi: e.name_yomi }) ) );

    this.dataIsReady$ = this.userNameList$.map( _ => true ).first().startWith(false);
  }

  ngOnInit() {
  }

}
