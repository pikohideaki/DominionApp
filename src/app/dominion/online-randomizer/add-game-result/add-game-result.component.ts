import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable, Subject } from 'rxjs/Rx';


import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';

import { MyRandomizerGroupService } from '../my-randomizer-group.service';

import { CardProperty  } from '../../../classes/card-property';
import { GameResult    } from '../../../classes/game-result';
import { PlayerResult  } from '../../../classes/player-result';
import { SelectedCards } from '../../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../../classes/selected-cards-checkbox-values';

import { SetVpDialogComponent } from './set-vp-dialog.component';
import { SetMemoDialogComponent } from '../../sub-components/set-memo-dialog.component';
import { SubmitGameResultDialogComponent } from '../../sub-components/submit-game-result-dialog/submit-game-result-dialog.component';



@Component({
  selector: 'app-add-game-result',
  templateUrl: './add-game-result.component.html',
  styleUrls: [
    '../../../my-own-library/data-table/data-table.component.css',
    './add-game-result.component.css'
  ]
})
export class AddGameResultComponent implements OnInit, OnDestroy {
  private alive = true;

  private dataIsReady = {
    selectedExpansions : new Subject(),
    cardPropertyList   : new Subject(),
    selectedCards      : new Subject(),
  };

  private selectedExpansions: string[] = [];
  private cardPropertyList: CardProperty[];
  private selectedCards: SelectedCards = new SelectedCards();


  places$: Observable<string[]>;

  playerResults$:   Observable<PlayerResult[]>;
  selectedPlayers$: Observable<PlayerResult[]>;
  private selectedPlayers: PlayerResult[] = [];
  numberOfPlayersOK$: Observable<boolean>;

  place = '';
  memo = '';
  lastTurnPlayerName: string = '';

  nextMissingNumber$: Observable<number>;
  private nextMissingNumber: number = 1;
  turnOrderFilled$: Observable<boolean>;

  newGameResultDialogOpened$: Observable<boolean>;

  myID: string = '';


  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private myUserInfo: MyUserInfoService,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    /* observables */
    this.playerResults$ = this.myRandomizerGroup.newGameResult.players$;
    this.selectedPlayers$ = this.playerResults$.map( list => list.filter( e => e.selected ) );

    this.numberOfPlayersOK$
      = this.selectedPlayers$.pluck('length').map( e => ( 2 <= e && e <= 6 ) );

    this.newGameResultDialogOpened$ = this.myRandomizerGroup.newGameResultDialogOpened$;

    this.places$
      = this.database.gameResultList$.map( gameResultList =>
          this.utils.uniq( gameResultList.map( e => e.place ).filter( e => e !== '' ) ) );

    const selectedExpansions$
      = Observable.combineLatest(
          this.database.expansionsNameList$,
          this.myRandomizerGroup.isSelectedExpansions$,
          (expansionsNameList, isSelectedExpansions) =>
            expansionsNameList.filter( (_, i) => isSelectedExpansions[i] ) );

    // turnOrders == [1, 0, 0, 2] -> 3
    this.nextMissingNumber$
      = this.selectedPlayers$.map( list => list.filter( e => e.turnOrder !== 0 ).length + 1 );

    this.turnOrderFilled$
      = this.selectedPlayers$.map( list => list.every( e => e.turnOrder !== 0 ) );


    /* subscriptions */
    this.myUserInfo.uid$
      .takeWhile( () => this.alive )
      .subscribe( val => this.myID = val );

    this.myRandomizerGroup.selectedCards$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.selectedCards = val;
        this.dataIsReady.selectedCards.complete();
      } );

    this.database.cardPropertyList$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.cardPropertyList = val;
        this.dataIsReady.cardPropertyList.complete();
      } );

    selectedExpansions$
      .takeWhile( () => this.alive )
      .subscribe( val => {
        this.selectedExpansions = val;
        this.dataIsReady.selectedExpansions.complete();
      });

    this.myRandomizerGroup.newGameResult.place$
      .takeWhile( () => this.alive )
      .subscribe( val => this.place = val );

    this.myRandomizerGroup.newGameResult.memo$
      .takeWhile( () => this.alive )
      .subscribe( val => this.memo = val );

    this.myRandomizerGroup.lastTurnPlayerName$
      .takeWhile( () => this.alive )
      .subscribe( val => this.lastTurnPlayerName = val );

    this.selectedPlayers$
      .takeWhile( () => this.alive )
      .subscribe( val => this.selectedPlayers = val );

    this.nextMissingNumber$
      .takeWhile( () => this.alive )
      .subscribe( val => this.nextMissingNumber = val );
  }


  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }


  async changePlace( place: string ) {
    await this.myRandomizerGroup.setNewGameResultPlace( place );
  }

  async changePlayersResultSelected( uid: string, value: boolean ) {
    await Promise.all([
      this.myRandomizerGroup.setNewGameResultPlayerSelected( uid, value ),
      this.resetTurnOrders(),
      this.changeLastTurnPlayerName(''),
    ]);
  }

  async changeLastTurnPlayerName( name: string ) {
    await this.myRandomizerGroup.setLastTurnPlayerName( name );
  }


  private async submitTurnOrders() {
    await Promise.all( [].concat(
      this.changeLastTurnPlayerName(''),
      this.selectedPlayers.map( player => {
        this.myRandomizerGroup.setNewGameResultPlayerTurnOrder( player.uid, player.turnOrder );
      } ))
    );
  }



  async resetTurnOrders() {
    this.selectedPlayers.forEach( e => e.turnOrder = 0 );
    await this.submitTurnOrders();
  }

  async shuffleTurnOrders() {
    if ( this.selectedPlayers.length < 2 ) return;
    const shuffledArray
      = this.utils.getShuffled( this.utils.numSeq( 1, this.selectedPlayers.length ) );
    this.selectedPlayers.forEach( (e, i) => e.turnOrder = shuffledArray[i] );
    await this.submitTurnOrders();
  }

  async rotateTurnOrders( step: number = 1 ) {
    if ( this.selectedPlayers.length < 2 ) return;
    const N = this.selectedPlayers.length;
    const next = val => (((val - 1) + N - step) % N) + 1;
    this.selectedPlayers.forEach( e => e.turnOrder = next( e.turnOrder ) );
    await this.submitTurnOrders();
  }

  async rotateAtRandom() {
    const rand = this.utils.randomNumber( 0, this.selectedPlayers.length -  1 );
    this.rotateTurnOrders( rand );
  }

  async setEmptyTurnOrder( playerIndex: number ) {
    // index == 2, turnOrders == [1, 0, 0, 2] -> [1, 0, 3, 2]
    const uid = this.selectedPlayers[ playerIndex ].uid;
    await this.myRandomizerGroup.setNewGameResultPlayerTurnOrder( uid, this.nextMissingNumber );
  }


  async submitGameResult() {
    /* wait for first value */
    await this.dataIsReady.selectedExpansions.toPromise();
    await this.dataIsReady.cardPropertyList.toPromise();
    await this.dataIsReady.selectedCards.toPromise();

    this.myRandomizerGroup.setNewGameResultDialogOpened(true);
    const dialogRef = this.dialog.open( SubmitGameResultDialogComponent );

    const indexToID = cardIndex => this.cardPropertyList[cardIndex].cardID;

    const newGameResult = new GameResult( null, {
      no         : 0,
      timeStamp  : Date.now(),
      place      : this.place,
      memo       : this.memo,
      selectedExpansions : this.selectedExpansions,
      selectedCardsID : {
        Prosperity      : this.selectedCards.Prosperity,
        DarkAges        : this.selectedCards.DarkAges,
        KingdomCards10  : this.selectedCards.KingdomCards10 .map( indexToID ),
        BaneCard        : this.selectedCards.BaneCard       .map( indexToID ),
        EventCards      : this.selectedCards.EventCards     .map( indexToID ),
        Obelisk         : this.selectedCards.Obelisk        .map( indexToID ),
        LandmarkCards   : this.selectedCards.LandmarkCards  .map( indexToID ),
        BlackMarketPile : this.selectedCards.BlackMarketPile.map( indexToID ),
      },
      players : this.selectedPlayers.map( pl => ({
                name      : pl.name,
                VP        : pl.VP,
                turnOrder : pl.turnOrder,
                rank      : 1,
                score     : 0,
              }) ),
      lastTurnPlayerName: this.lastTurnPlayerName,
    });

    dialogRef.componentInstance.newGameResult = newGameResult;

    dialogRef.afterClosed().subscribe( result => {
      this.myRandomizerGroup.setNewGameResultDialogOpened(false);
      if ( result === 'OK Clicked' ) {
        this.myRandomizerGroup.resetSelectedCards();
        this.myRandomizerGroup.resetSelectedCardsCheckbox();
        this.selectedPlayers.forEach( player => {
          this.myRandomizerGroup.setNewGameResultPlayerVP( player.uid, 0 );
        });
        this.myRandomizerGroup.setNewGameResultMemo('');
        this.myRandomizerGroup.resetVPCalculator();
        this.openSnackBar();
      }
    });
  }


  private openSnackBar() {
    this.snackBar.open( 'Successfully Submitted!', undefined, { duration: 3000 } );
  }

  VPClicked( uid: string ) {
    const dialogRef = this.dialog.open( SetVpDialogComponent );
    dialogRef.componentInstance.VP = this.selectedPlayers.find( e => e.uid === uid ).VP;
    dialogRef.afterClosed().subscribe( result => {
      if ( !result ) return;
      this.myRandomizerGroup.setNewGameResultPlayerVP( uid, result );
    });
  }


  memoClicked() {
    const dialogRef = this.dialog.open( SetMemoDialogComponent );
    dialogRef.componentInstance.memo = this.memo;
    dialogRef.afterClosed().subscribe( result => {
      if ( result === undefined ) return;
      this.myRandomizerGroup.setNewGameResultMemo( result );
    });
  }

}
