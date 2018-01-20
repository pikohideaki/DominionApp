import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { TurnInfo } from '../../../../classes/game-state';
import { GameStateService } from '../game-state.service';


@Component({
  selector: 'app-turn-info',
  templateUrl: './turn-info.component.html',
  styleUrls: ['./turn-info.component.css']
})
export class TurnInfoComponent implements OnInit {

  turnInfo$: Observable<TurnInfo>;

  phaseCharacter$:  Observable<string>;
  turnInfo_Action$: Observable<number>;
  turnInfo_Buy$:    Observable<number>;
  turnInfo_Coin$:   Observable<number>;

  constructor(
    private gameStateService: GameStateService
  ) {
    this.turnInfo$ = this.gameStateService.turnInfo$;
  }


  ngOnInit() {
    this.phaseCharacter$  = this.turnInfo$.map( e => {
          switch ( e.phase ) {
            case ''        : return '';
            case 'Action'  : return 'A';
            case 'Action*' : return 'A*';
            case 'Buy'     : return 'B';
            case 'Buy*'    : return 'B*';
            case 'BuyCard' : return `B'`;
            case 'Night'   : return 'N';
            case 'CleanUp' : return 'C';
            default :
              throw new Error(`unknown phase name '${e.phase}'`);
          }
      });
    this.turnInfo_Action$ = this.turnInfo$.map( e => e.action );
    this.turnInfo_Buy$    = this.turnInfo$.map( e => e.buy    );
    this.turnInfo_Coin$   = this.turnInfo$.map( e => e.coin   );
  }
}
