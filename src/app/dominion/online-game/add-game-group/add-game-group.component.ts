import { Component, OnInit, Input } from '@angular/core';
import { isDevMode } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';

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
export class AddGameGroupComponent implements OnInit {
  // form elements
  private memoSource = new BehaviorSubject<string>('');
  memo$ = this.memoSource.asObservable();

  numberOfPlayers$ = this.user.onlineGame.numberOfPlayers$;
  isSelectedExpansions$ = this.user.onlineGame.isSelectedExpansions$;

  // app-randomizer
  private selectedCardsSource
    = new BehaviorSubject<SelectedCards>( new SelectedCards() );
  selectedCards$ = this.selectedCardsSource.asObservable();

  private BlackMarketPileShuffledSource
    = new BehaviorSubject<BlackMarketPileCard[]>([]);
  BlackMarketPileShuffled$ = this.BlackMarketPileShuffledSource.asObservable();

  private preparingDialogSource
    = new BehaviorSubject<boolean>(false);
  preparingDialog$ = this.preparingDialogSource.asObservable();

  disableMakeRoomButton$: Observable<boolean>
    = Observable.combineLatest(
        this.numberOfPlayers$.map( e => !this.utils.isInRange( e, 2, 7 ) ),
        this.isSelectedExpansions$.map( list => list.every( e => !e ) ),
        this.selectedCards$.map( e => e.isEmpty() ),
        this.preparingDialog$,
        (...conditions: boolean[]) => conditions.some( e => e ) )
      .startWith( true )
      .distinctUntilChanged();

  isdevmode: boolean = isDevMode();
  addTestPlayer: boolean = false;


  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private user: MyUserInfoService,
    private addGameGroupService: AddGameGroupService
  ) {
  }

  ngOnInit() {
  }


  selectedCardsOnChange( value: SelectedCards ) {
    if ( this.isdevmode ) {
      console.log('selected test KingdomCards', value.KingdomCards10);
    }
    this.selectedCardsSource.next( value );
  }

  BlackMarketPileShuffledOnChange( value: BlackMarketPileCard[] ) {
    this.BlackMarketPileShuffledSource.next( value );
  }

  increment( currentValue: number ) {
    this.user.setOnlineGameNumberOfPlayers( currentValue + 1 );
  }

  decrement( currentValue: number ) {
    this.user.setOnlineGameNumberOfPlayers( currentValue - 1 );
  }

  isSelectedExpansionsOnChange( value: { index: number, checked: boolean } ) {
    this.user.setOnlineGameIsSelectedExpansions( value.index, value.checked );
  }

  memoClicked() {
    const dialogRef = this.dialog.open( SetMemoDialogComponent );
    dialogRef.componentInstance.memo = this.memoSource.getValue();
    dialogRef.afterClosed().subscribe( value => {
      if ( value === undefined ) return;
      this.memoSource.next( value );
    });
  }


  async makeNewGameRoomClicked(
    numberOfPlayers:      number,
    isSelectedExpansions: boolean[]
  ) {
    this.preparingDialogSource.next( true );
    await this.makeNewGameRoom( numberOfPlayers, isSelectedExpansions );
    this.preparingDialogSource.next( false );
  }

  private async makeNewGameRoom(
    numberOfPlayers:      number,
    isSelectedExpansions: boolean[]
  ) {
    const newRoom = await this.addGameGroupService.init(
        numberOfPlayers,
        isSelectedExpansions,
        this.memoSource.getValue(),
        this.selectedCardsSource.getValue() );

    // dialog
    const dialogRef = this.dialog.open( SignInToGameRoomDialogComponent );
    dialogRef.componentInstance.newRoom = newRoom;
    dialogRef.componentInstance.dialogRef = dialogRef;
    dialogRef.disableClose = true;

    if ( this.addTestPlayer ) {
      await this.utils.sleep(2);
      await this.database.onlineGameRoom.addMember( newRoom.databaseKey, 'testPlayer' );
      console.log('added testPlayer');
    }

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

  addTestPlayerChecked( value: boolean ) {
    this.addTestPlayer = value;
  }
}
