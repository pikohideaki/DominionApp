import { Component, OnInit } from '@angular/core';

import { FireDatabaseService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { GameResult } from '../../../classes/game-result';


@Component({
  selector: 'app-submit-game-result-dialog',
  templateUrl: './submit-game-result-dialog.component.html',
  styleUrls: [
    '../../../my-own-library/data-table/data-table.component.css',
    './submit-game-result-dialog.component.css'
  ]
})
export class SubmitGameResultDialogComponent implements OnInit {
  newGameResult: GameResult;  // input


  constructor(
    private database: FireDatabaseService,
  ) {
  }

  ngOnInit() {
    this.database.scoringTable$.first()
    .subscribe( defaultScores => {
      this.newGameResult.rankPlayers();
      this.newGameResult.setScores( defaultScores );
    });
  }

  submitGameResult() {
    this.database.gameResult.add( this.newGameResult );
  }
}
