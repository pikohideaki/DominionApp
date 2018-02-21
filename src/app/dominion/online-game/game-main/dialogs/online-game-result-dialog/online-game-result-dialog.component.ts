import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GameResult } from '../../../../../classes/game-result';

@Component({
  selector: 'app-online-game-result-dialog',
  templateUrl: './online-game-result-dialog.component.html',
  styleUrls: [
    '../../../../../my-own-library/data-table/data-table.component.css',
    './online-game-result-dialog.component.css'
  ]
})
export class OnlineGameResultDialogComponent implements OnInit {

  gameResult$: Observable<GameResult>;  // input


  constructor(
  ) {}

  ngOnInit() {
  }
}
