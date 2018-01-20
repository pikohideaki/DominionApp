import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { ColumnSetting } from '../../my-own-library/data-table/data-table.component';


@Component({
  selector: 'app-scoring-table',
  template: `
    <div class="body-with-padding">
      <app-data-table
          [data$]='scoringTableForView$'
          [columnSettings]='columnSettings' >
      </app-data-table>
      <app-waiting-spinner [done]="receiveDataDone$ | async"></app-waiting-spinner>
    </div>
  `,
  styles: []
})
export class ScoringTableComponent implements OnInit {

  receiveDataDone$: Observable<boolean>;

  scoringTableForView$: Observable<{
    numberOfPlayers: number,
    rank_1st: string,
    rank_2nd: string,
    rank_3rd: string,
    rank_4th: string,
    rank_5th: string,
    rank_6th: string,
  }[]>;

  columnSettings: ColumnSetting[] = [
    { name: 'numberOfPlayers', headerTitle: 'プレイヤー数' },
    { name: 'rank_1st'       , headerTitle: '1位' },
    { name: 'rank_2nd'       , headerTitle: '2位' },
    { name: 'rank_3rd'       , headerTitle: '3位' },
    { name: 'rank_4th'       , headerTitle: '4位' },
    { name: 'rank_5th'       , headerTitle: '5位' },
    { name: 'rank_6th'       , headerTitle: '6位' },
  ];


  constructor(
    private database: CloudFirestoreMediatorService
  ) {
    this.scoringTableForView$
      = this.database.scoringTable$
          .map( scoringTable =>
            scoringTable
              .map( (value, index) => ({ numberOfPlayers: index, score: value }) )
              .filter( e => e.score[1] > 0 )
              .map( e => ({
                  numberOfPlayers : e.numberOfPlayers,
                  rank_1st : ( e.score[1] < 0 ? '' : e.score[1].toString() ),
                  rank_2nd : ( e.score[2] < 0 ? '' : e.score[2].toString() ),
                  rank_3rd : ( e.score[3] < 0 ? '' : e.score[3].toString() ),
                  rank_4th : ( e.score[4] < 0 ? '' : e.score[4].toString() ),
                  rank_5th : ( e.score[5] < 0 ? '' : e.score[5].toString() ),
                  rank_6th : ( e.score[6] < 0 ? '' : e.score[6].toString() ),
                }) )
          );

    this.receiveDataDone$
      = this.scoringTableForView$.map( _ => true ).startWith(false);
  }

  ngOnInit() {
  }

}
