import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { isDevMode } from '@angular/core';

import { Observable      } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';

import { MatDialog, MatSnackBar } from '@angular/material';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { AddGameGroupService } from './add-game-group.service';

import { SignInToGameRoomDialogComponent } from '../sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';
import { SetMemoDialogComponent } from '../../sub-components/set-memo-dialog.component';

import { SelectedCards       } from '../../../classes/selected-cards';
import { BlackMarketPileCard } from '../../../classes/black-market-pile-card';



@Component({
  providers: [AddGameGroupService],
  selector: 'app-add-game-group',
  templateUrl: './add-game-group.component.html',
  styles: [`
    .mini-button {
      padding : 0;
      min-width : 0;
      width: 35px;
      color: rgba(0,0,0,.54);
    }
  `]
})
export class AddGameGroupComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  // form elements
  private memoSource = new BehaviorSubject<string>('');
  memo$ = this.memoSource.asObservable();

  private numberOfPlayersSource = new BehaviorSubject<number>(2);
  numberOfPlayers$ = this.numberOfPlayersSource.asObservable();

  private isSelectedExpansionsSource = new BehaviorSubject<boolean[]>([]);
  isSelectedExpansions$ = this.isSelectedExpansionsSource.asObservable();

  formIsInvalid$: Observable<boolean>
    = Observable.combineLatest(
          this.numberOfPlayers$, this.isSelectedExpansions$,
          (numberOfPlayers, isSelectedExpansions) =>
            !this.utils.isInRange( numberOfPlayers, 2, 7)
             || isSelectedExpansions.every( e => !e ) );

  // app-randomizer
  selectedCardsSource = new BehaviorSubject<SelectedCards>( new SelectedCards() );
  selectedCards$ = this.selectedCardsSource.asObservable();

  BlackMarketPileShuffledSource = new BehaviorSubject<BlackMarketPileCard[]>([]);
  BlackMarketPileShuffled$ = this.BlackMarketPileShuffledSource.asObservable();


  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService,
    private addGameGroupService: AddGameGroupService
  ) {
    this.myUserInfo.onlineGame.isSelectedExpansions$
      .takeWhile( () => this.alive )
      .subscribe( val => this.isSelectedExpansionsSource.next( val ) );

    this.myUserInfo.onlineGame.numberOfPlayers$
      .takeWhile( () => this.alive )
      .subscribe( val => this.numberOfPlayersSource.next( val ) );

    if ( isDevMode() ) {
      const selectedCards = this.selectedCardsSource.getValue();
      selectedCards.KingdomCards10 = this.utils.numberSequence(7, 10);
      this.selectedCardsSource.next( selectedCards );
      this.isSelectedExpansionsOnChange({ index: 1, checked: true });
      console.log('selected test 10 KingdomCards');
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }


  increment() {
    const newValue = this.numberOfPlayersSource.getValue() + 1;
    this.numberOfPlayersSource.next( newValue );
    this.myUserInfo.setOnlineGameNumberOfPlayers( newValue );
  }

  decrement() {
    const newValue = this.numberOfPlayersSource.getValue() - 1;
    this.numberOfPlayersSource.next( newValue );
    this.myUserInfo.setOnlineGameNumberOfPlayers( newValue );
  }

  isSelectedExpansionsOnChange( value: { index: number, checked: boolean } ) {
    const newValue = this.isSelectedExpansionsSource.getValue();
    newValue[ value.index ] = value.checked;
    this.isSelectedExpansionsSource.next( newValue );
    this.myUserInfo.setOnlineGameIsSelectedExpansions( newValue );
  }

  memoClicked() {
    const dialogRef = this.dialog.open( SetMemoDialogComponent );
    dialogRef.componentInstance.memo = this.memoSource.getValue();
    dialogRef.afterClosed().subscribe( value => {
      if ( value === undefined ) return;
      this.memoSource.next( value );
    });
  }

  async makeNewGameRoom() {
    const newRoom = await this.addGameGroupService.init(
        this.numberOfPlayersSource.getValue(),
        this.isSelectedExpansionsSource.getValue(),
        this.memoSource.getValue(),
        this.selectedCardsSource.getValue() );

    // dialog
    const dialogRef = this.dialog.open( SignInToGameRoomDialogComponent );
    dialogRef.componentInstance.newRoom = newRoom;
    dialogRef.componentInstance.dialogRef = dialogRef;
    dialogRef.disableClose = true;

    await this.utils.sleep(2);
    await this.database.onlineGameRoom.addMember( newRoom.databaseKey, 'testPlayer' );
    console.log('added testPlayer');

    const result = await dialogRef.afterClosed().toPromise();

    if ( result === 'Cancel Clicked' ) {
      this.database.onlineGameRoom.remove( newRoom.databaseKey );
      this.database.onlineGameCommunication.remove( newRoom.gameRoomCommunicationId );
    } else {
      this.openSnackBar('Successfully signed in!');
    }
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }

  selectedCardsOnChange( value ) {
    this.selectedCardsSource.next( value );
  }

  BlackMarketPileShuffledOnChange( value ) {
    this.BlackMarketPileShuffledSource.next( value );
  }

}
