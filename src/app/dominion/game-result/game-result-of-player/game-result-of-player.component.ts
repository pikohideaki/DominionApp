import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { UtilitiesService } from '../../../my-own-library/utilities.service';

import { GameResult } from '../../../classes/game-result';


@Component({
  selector: 'app-game-result-of-player',
  templateUrl: './game-result-of-player.component.html',
  styleUrls: [ '../../../my-own-library/data-table/data-table.component.css' ]
})
export class GameResultOfPlayerComponent implements OnInit, OnDestroy {
  private alive = true;

  @Input() private gameResultListFiltered$: Observable<GameResult[]>;

  gameResultOfEachPlayerForView;

  private sortKeySource = new BehaviorSubject<string>('scoreAverage');
  private sortKey$ = this.sortKeySource.asObservable();

  rankOptions: boolean[] = [true, true, true, true, true, false, false ];

  headerSettings = [
    { key: 'rank',         show: true,                isButton: false, title: '順位' },
    { key: 'name',         show: true,                isButton: false, title: '名前' },
    { key: 'scoreAverage', show: true,                isButton: true,  title: '平均得点' },
    { key: 'scoreSum',     show: true,                isButton: true,  title: '総得点' },
    { key: 'count',        show: true,                isButton: true,  title: '総対戦回数' },
    { key: 'countRank1',   show: true,                isButton: true,  title: '1位回数' },
    { key: 'countRank2',   show: true,                isButton: true,  title: '2位回数' },
    { key: 'countRank3',   show: this.rankOptions[3], isButton: true,  title: '3位回数' },
    { key: 'countRank4',   show: this.rankOptions[4], isButton: true,  title: '4位回数' },
    { key: 'countRank5',   show: this.rankOptions[5], isButton: true,  title: '5位回数' },
    { key: 'countRank6',   show: this.rankOptions[6], isButton: true,  title: '6位回数' },
  ];


  constructor(
    private utils: UtilitiesService
  ) {
  }


  ngOnInit() {
    const gameResultOfEachPlayerForView$
      = Observable.combineLatest(
        this.gameResultListFiltered$, this.sortKey$,
        (grList, sortKey) => {
          const result = this.getGameResultOfEachPlayer( grList );
          return this.toGameResultOfEachPlayerForView( result, sortKey );
        } );

    gameResultOfEachPlayerForView$
      .takeWhile( () => this.alive )
      .subscribe( val => this.gameResultOfEachPlayerForView = val );

    this.gameResultListFiltered$
      .takeWhile( () => this.alive )
      .subscribe( gameResultListFiltered => {
        const maxNumberOfPlayers = this.utils.maxOfArray( gameResultListFiltered.map( e => e.players.length ) );
        this.rankOptions = Array.from( new Array(7) ).fill(true).fill( false, maxNumberOfPlayers + 1 );
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }


  setSortKey( sortKey: string ) {
    this.sortKeySource.next( sortKey );
  }



  getGameResultOfEachPlayer( gameResultListFiltered: GameResult[] ) {
    // get all player names
    const userNamesFiltered = new Set();
    gameResultListFiltered.forEach( gr => gr.players.forEach( player => {
      userNamesFiltered.add( player.name );
    }));

    // initialize
    const gameResultOfEachPlayer = [];
    userNamesFiltered.forEach( name => {
      gameResultOfEachPlayer[name] = {
        count        : 0,
        countRank    : [0, 0, 0, 0, 0, 0, 0],
        scoreSum     : 0.0,
        scoreAverage : 0.0,
      };
    } );

    // sum up rank & score of each player
    gameResultListFiltered.forEach( gr => gr.players.forEach( player => {
      gameResultOfEachPlayer[ player.name ].countRank[ player.rank ]++;
      gameResultOfEachPlayer[ player.name ].scoreSum += player.score;
    }));

    // calculate countRank and score average
    this.utils.objectForEach( gameResultOfEachPlayer, playerResult => {
      playerResult.countRank.forEach( e => playerResult.count += e );  // sum of countRank
      playerResult.scoreAverage = playerResult.scoreSum / playerResult.count;
    });

    return gameResultOfEachPlayer;
  }



  toGameResultOfEachPlayerForView( gameResultOfEachPlayer, sortKey ) {
    // round and sort
    const gameResultOfEachPlayerForView = [];  // reset
    this.utils.objectForEach( gameResultOfEachPlayer, (playerResult, playerName) => {
      gameResultOfEachPlayerForView.push( {
        name         : playerName,
        scoreAverage : this.utils.roundAt( playerResult.scoreAverage, 3 ),
        scoreSum     : this.utils.roundAt( playerResult.scoreSum, 3 ),
        count        : playerResult.count,
        countRank    : playerResult.countRank
      });
    });
    switch ( sortKey ) {
      case 'scoreAverage' :
      case 'scoreSum' :
      case 'count' :
        gameResultOfEachPlayerForView.sort( (a, b) => b[sortKey] - a[sortKey] );
        break;

      case 'countRank1' :
        gameResultOfEachPlayerForView.sort( (a, b) => b.countRank[1] - a.countRank[1] );
        break;
      case 'countRank2' :
        gameResultOfEachPlayerForView.sort( (a, b) => b.countRank[2] - a.countRank[2] );
        break;
      case 'countRank3' :
        gameResultOfEachPlayerForView.sort( (a, b) => b.countRank[3] - a.countRank[3] );
        break;
      case 'countRank4' :
        gameResultOfEachPlayerForView.sort( (a, b) => b.countRank[4] - a.countRank[4] );
        break;
      case 'countRank5' :
        gameResultOfEachPlayerForView.sort( (a, b) => b.countRank[5] - a.countRank[5] );
        break;
      case 'countRank6' :
        gameResultOfEachPlayerForView.sort( (a, b) => b.countRank[6] - a.countRank[6] );
        break;
    }
    return gameResultOfEachPlayerForView;
  }



}
