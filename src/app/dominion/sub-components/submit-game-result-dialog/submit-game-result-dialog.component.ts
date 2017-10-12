import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameResult } from '../../../classes/game-result';


@Component({
  selector: 'app-submit-game-result-dialog',
  templateUrl: './submit-game-result-dialog.component.html',
  styleUrls: [
    '../../../my-own-library/data-table/data-table.component.css',
    './submit-game-result-dialog.component.css'
  ]
})
export class SubmitGameResultDialogComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() newGameResult: GameResult;


  constructor(
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
  ) {
  }

  ngOnInit() {
    this.database.scoringTable$
      .takeWhile( () => this.alive )
      .subscribe( defaultScores => {
        this.newGameResult.rankPlayers();
        this.newGameResult.setScores( defaultScores );
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  submitGameResult() {
    this.database.gameResult.add( this.newGameResult );
  }
}
