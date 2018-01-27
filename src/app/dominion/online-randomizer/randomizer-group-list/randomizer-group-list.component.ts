import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

import { Observable } from 'rxjs/Observable';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';

import { MyRandomizerGroupService } from '../my-randomizer-group.service';

import { SelectedCards         } from '../../../classes/selected-cards';
import { RandomizerGroup       } from '../../../classes/randomizer-group';
import { User                  } from '../../../classes/user';
import { SelectedCardsCheckbox } from '../../../classes/selected-cards-checkbox-values';
import { BlackMarketPhase      } from '../../../classes/black-market-phase.enum';


@Component({
  selector: 'app-randomizer-group-list',
  templateUrl: './randomizer-group-list.component.html',
  styleUrls: ['./randomizer-group-list.component.css']
})
export class RandomizerGroupListComponent implements OnInit {

  @Input() private sidenav;

  uid$:        Observable<string> = this.myUserInfo.uid$;
  myName$:     Observable<string> = this.myUserInfo.name$;
  myNameYomi$: Observable<string> = this.myUserInfo.nameYomi$;

  randomizerGroupListWithUsers$: Observable<{ group: RandomizerGroup, users: string[] }[]>
    = Observable.combineLatest(
          this.database.randomizerGroupList$,
          this.database.users$,
          (randomizerGroupList, users) =>
            randomizerGroupList.map( group => ({
              group: group,
              users: users.filter( user => user.randomizerGroupId === group.databaseKey )
                          .map( user => user.name ),
            })) );

  newGroupName:     string;
  newGroupPassword: string;
  signInPassword:   string;
  showWrongPasswordAlert = false;
  selectedGroupId = '';


  constructor(
    public snackBar: MatSnackBar,
    private utils: UtilitiesService,
    private myUserInfo: MyUserInfoService,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
  }

  ngOnInit() {
  }


  /* sidenav */
  closeSideNav() {
    this.resetSignInForm();
    this.resetAddGroupForm();
    this.sidenav.close();
  }

  backgroundClicked() {
    this.resetSignInForm();
    this.selectedGroupId = '';
  }


  /* 新規グループ */
  newGroupNameOnChange( value ) {
    this.newGroupName = value;
  }

  newGroupPasswordOnChange( value ) {
    this.newGroupPassword = value;
  }

  async addRandomizerGroup(
    uid:                string,
    myName:             string,
    myNameYomi:         string,
    groupListWithUsers: { group: RandomizerGroup, users: string[] }[]
  ) {
    const expansionsNameList
      = await this.database.expansionsNameList$.first().toPromise();
    const isSelectedExpansionsInit = expansionsNameList.map( _ => true );

    const newRandomizerGroup = new RandomizerGroup( null, {
        name:                    this.newGroupName,
        password:                this.newGroupPassword,
        timeStamp:               Date.now(),
        isSelectedExpansions:    isSelectedExpansionsInit,
        selectedCardsCheckbox:   new SelectedCardsCheckbox(),
        BlackMarketPileShuffled: [],
        BlackMarketPhase:        BlackMarketPhase.init,
        selectedCardsHistory:    [],
        selectedIndexInHistory:  0,
        newGameResult: {
          players:            {},
          place:              '',
          memo:               '',
          lastTurnPlayerName: '',
        },
        newGameResultDialogOpened: false,
        resetVPCalculator:         0,
    });

    const ref = await this.database.randomizerGroup.addGroup( newRandomizerGroup );
    const groupId = ref.key;
    await this.myUserInfo.setRandomizerGroupId( groupId );
    await this.myRandomizerGroup.addMember( groupId, uid, myName, myNameYomi );
    await this.removeMemberEmptyGroup( groupListWithUsers );
    this.resetAddGroupForm();

    this.openSnackBar('Successfully signed in!');
    this.sidenav.close();
  }



  /* グループ選択 */
  groupClicked( $event, groupId: string ) {
    this.resetSignInForm();
    this.selectedGroupId = groupId;
    $event.stopPropagation();
  }

  toYMDHMS( date: Date ) {
    return this.utils.toYMDHMS( date );
  }

  signInPasswordOnChange( value ) {
    this.signInPassword = value;
  }

  async signIn(
    groupId:            string,
    uid:                string,
    myName:             string,
    myNameYomi:         string,
    groupListWithUsers: { group: RandomizerGroup, users: string[] }[]
  ) {
    if ( !this.signInPasswordIsValid( groupId, groupListWithUsers ) ) return;

    this.resetSignInForm();
    await Promise.all([
      this.myUserInfo.setRandomizerGroupId( groupId ),
      this.myRandomizerGroup.addMember( groupId, uid, myName, myNameYomi ),
    ]);

    this.openSnackBar('Successfully signed in!');
    this.sidenav.close();
    await this.removeMemberEmptyGroup( groupListWithUsers );
  }

  async signOut(
    groupId:            string,
    uid:                string,
    groupListWithUsers: { group: RandomizerGroup, users: string[] }[]
  ) {
    if ( !this.signInPasswordIsValid( groupId, groupListWithUsers ) ) return;

    this.resetSignInForm();
    await Promise.all([
      this.myRandomizerGroup.removeMember( groupId, uid ),
      this.myUserInfo.setRandomizerGroupId(''),
    ]);

    this.openSnackBar('Successfully signed out!');
    this.sidenav.close();
    await this.removeMemberEmptyGroup( groupListWithUsers );
  }



  /* private methods */
  private signInPasswordIsValid(
    groupId:            string,
    groupListWithUsers: { group: RandomizerGroup, users: string[] }[]
  ): boolean {
    const group = groupListWithUsers.find( g => g.group.databaseKey === groupId ).group;
    const isValid = ( !group.password ) || ( this.signInPassword === group.password );
    this.showWrongPasswordAlert = !isValid;
    return isValid;
  }

  private async removeMemberEmptyGroup(
    groupListWithUsers: { group: RandomizerGroup, users: string[] }[]
  ) {
    await Promise.all(
      groupListWithUsers
        .filter( g => g.users.length === 0 )
        .map( g => this.database.randomizerGroup.removeGroup( g.group.databaseKey ) ) );
  }

  private resetAddGroupForm() {
    this.newGroupName = undefined;
    this.newGroupPassword = undefined;
  }

  private resetSignInForm() {
    this.signInPassword = undefined;
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }
}
