import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeWhile';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';

import { MyRandomizerGroupService } from '../my-randomizer-group.service';

import { SelectedCards         } from '../../../classes/selected-cards';
import { RandomizerGroup       } from '../../../classes/randomizer-group';
import { User                  } from '../../../classes/user';
import { PlayerResult          } from '../../../classes/player-result';
import { SelectedCardsCheckbox } from '../../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../../classes/black-market-pile-card';
import { BlackMarketPhase      } from '../../../classes/black-market-phase.enum';


@Component({
  selector: 'app-randomizer-group-list',
  templateUrl: './randomizer-group-list.component.html',
  styleUrls: ['./randomizer-group-list.component.css']
})
export class RandomizerGroupListComponent implements OnInit, OnDestroy {
  private alive = true;

  @Input() private sidenav;
  newGroupName: string;
  newGroupPassword: string;
  signInPassword: string;
  showWrongPasswordAlert = false;
  selectedGroupId = '';

  uid: string;
  myName: string;

  randomizerGroupListWithUsers$: Observable<{ group: RandomizerGroup, users: string[] }[]>;
  private randomizerGroupListWithUsers: { group: RandomizerGroup, users: string[] }[] = [];

  constructor(
    public snackBar: MatSnackBar,
    public utils: UtilitiesService,
    private myUserInfo: MyUserInfoService,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    this.randomizerGroupListWithUsers$
      = Observable.combineLatest(
            this.database.randomizerGroupList$,
            this.database.users$,
            (randomizerGroupList, users) =>
              randomizerGroupList.map( group => ({
                group: group,
                users: users.filter( user => user.randomizerGroupId === group.databaseKey )
                            .map( user => user.name ),
              }))
      );


    this.randomizerGroupListWithUsers$
      .takeWhile( () => this.alive )
      .subscribe( val => this.randomizerGroupListWithUsers = val );

    this.myUserInfo.uid$
      .takeWhile( () => this.alive )
      .subscribe( val => this.uid = val );

    this.myUserInfo.name$
      .takeWhile( () => this.alive )
      .subscribe( val => this.myName = val );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }


  private signInPasswordIsValid( groupId ): boolean {
    const group = this.randomizerGroupListWithUsers
                    .map( e => e.group )
                    .find( g => g.databaseKey === groupId );
    const isValid = ( !group.password ) || ( this.signInPassword === group.password );
    this.showWrongPasswordAlert = !isValid;
    return isValid;
  }

  private removeMemberEmptyGroup() {
    const promises
      = this.randomizerGroupListWithUsers
            .filter( g => g.users.length === 0 )
            .map( g => this.database.randomizerGroup.removeGroup( g.group.databaseKey ) );
    return Promise.all( promises );
  }

  private resetAddGroupForm() {
    this.newGroupName = undefined;
    this.newGroupPassword = undefined;
  }

  private resetSignInForm() {
    this.signInPassword = undefined;
  }

  async addRandomizerGroup() {
    // await this.myUserInfo.myId$.first().toPromise();
    // await this.myUserInfo.name$.first().toPromise();

    const expansionsNameList
      = await this.database.expansionsNameList$.first().toPromise();
    const isSelectedExpansionsInit = expansionsNameList.map( _ => true );

    const newRandomizerGroup = new RandomizerGroup( null, {
        name:                      this.newGroupName,
        password:                  this.newGroupPassword,
        timeStamp:                 Date.now(),
        randomizerButtonLocked:    false,
        isSelectedExpansions:      isSelectedExpansionsInit,
        selectedCards:             new SelectedCards(),
        selectedCardsCheckbox:     new SelectedCardsCheckbox(),
        BlackMarketPileShuffled:   [],
        BlackMarketPhase:          BlackMarketPhase.init,
        newGameResult: {
          players: {},
          place:   '',
          memo:    '',
        },
        newGameResultDialogOpened: false,
        lastTurnPlayerName:        '',
        resetVPCalculator:         0,
        selectedCardsHistory:      [],
    });

    const ref = await this.database.randomizerGroup.addGroup( newRandomizerGroup );
    const groupId = ref.key;
    await this.myUserInfo.setRandomizerGroupId( groupId );
    await this.myRandomizerGroup.addMember( groupId, this.uid, this.myName );
    await this.removeMemberEmptyGroup();
    this.resetAddGroupForm();

    this.openSnackBar('Successfully signed in!');
    this.sidenav.close();
  }


  signIn = async ( groupId ) => {
    if ( !this.signInPasswordIsValid( groupId ) ) return;

    await this.myUserInfo.uid$.first().toPromise(); // wait for first value
    await this.myUserInfo.name$.first().toPromise(); // wait for first value

    await this.myUserInfo.setRandomizerGroupId( groupId );
    await this.myRandomizerGroup.addMember( groupId, this.uid, this.myName );

    await this.removeMemberEmptyGroup();
    this.resetSignInForm();
    this.openSnackBar('Successfully signed in!');
    this.sidenav.close();
  }

  signOut = async ( groupId ) => {
    if ( !this.signInPasswordIsValid( groupId ) ) return;

    await this.myUserInfo.uid$.first().toPromise();  // wait for first value

    await this.myRandomizerGroup.removeMember( groupId, this.uid );
    await this.myUserInfo.setRandomizerGroupId('');

    await this.removeMemberEmptyGroup();
    this.resetSignInForm();
    this.openSnackBar('Successfully signed out!');
    this.sidenav.close();
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }


  // view

  groupClicked( $event, groupId: string ) {
    this.resetSignInForm();
    this.selectedGroupId = groupId;
    $event.stopPropagation();
  }

  backgroundClicked() {
    this.resetSignInForm();
    this.selectedGroupId = '';
  }

  closeSideNav() {
    this.resetSignInForm();
    this.resetAddGroupForm();
    this.sidenav.close();
  }

  newGroupNameOnChange( value ) {
    this.newGroupName = value;
  }

  newGroupPasswordOnChange( value ) {
    this.newGroupPassword = value;
  }

  signInPasswordOnChange( value ) {
    this.signInPassword = value;
  }
}
