import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { TurnInfo } from '../../../../classes/game-room';

@Component({
  selector: 'app-turn-info',
  templateUrl: './turn-info.component.html',
  styleUrls: ['./turn-info.component.css']
})
export class TurnInfoComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() private turnInfo$: Observable<TurnInfo>;
  turnInfo: TurnInfo = new TurnInfo();

  phaseCharacter: string;

  constructor() { }


  ngOnInit() {
    this.turnInfo$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.turnInfo = val;
        switch ( this.turnInfo.phase ) {
          case 'action'  : this.phaseCharacter = 'A';  break;
          case 'action*' : this.phaseCharacter = 'A*'; break;
          case 'buy'     : this.phaseCharacter = 'B';  break;
          case 'buy*'    : this.phaseCharacter = 'B*'; break;
          case 'buyCard' : this.phaseCharacter = `B'`; break;
          case 'cleanUp' : this.phaseCharacter = 'C';  break;
          case ''        : this.phaseCharacter = '';   break;
          default :
            throw new Error(`unknown phase name '${this.turnInfo.phase}'`);
        }
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
