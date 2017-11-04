import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';

import { RandomizerGroup       } from '../../classes/randomizer-group';
import { SelectedCards         } from '../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../classes/black-market-pile-card';
import { PlayerResult          } from '../../classes/player-result';


@Injectable()
export class MyRandomizerGroupService {
  private myRandomizerGroupID: string = '';

  private myRandomizerGroup$: Observable<RandomizerGroup>
   = Observable.combineLatest(
      this.database.randomizerGroupList$,
      this.myUserInfo.randomizerGroupID$,
      (list, id) => (list.find( e => e.databaseKey === id ) || new RandomizerGroup() ) );
      // .do( val => console.log('myRandomizerGroup changed', val) );

  private signedIn$: Observable<boolean> = this.myUserInfo.signedIn$;


  name$                      = this.myRandomizerGroup$.map( e => e.name                      ).distinctUntilChanged();
  randomizerButtonLocked$    = this.myRandomizerGroup$.map( e => e.randomizerButtonLocked    ).distinctUntilChanged();
  isSelectedExpansions$      = Observable.combineLatest(
                this.database.expansionsNameList$.map( list => list.map( _ => false ) ),
                this.myRandomizerGroup$.map( e => e.isSelectedExpansions      ).distinctUntilChanged(),
                (initArray, isSelectedExpansions) => initArray.map( (_, i) => !!isSelectedExpansions[i] ) );

  selectedCards$             = this.myRandomizerGroup$.map( e => e.selectedCards             ).distinctUntilChanged();
  selectedCardsCheckbox$     = this.myRandomizerGroup$.map( e => e.selectedCardsCheckbox     ).distinctUntilChanged();
  BlackMarketPileShuffled$   = this.myRandomizerGroup$.map( e => e.BlackMarketPileShuffled   ).distinctUntilChanged();
  BlackMarketPhase$          = this.myRandomizerGroup$.map( e => e.BlackMarketPhase          ).distinctUntilChanged();
  newGameResult = {
    players$ : this.myRandomizerGroup$.map( e => e.newGameResult.players ).distinctUntilChanged(),
    place$   : this.myRandomizerGroup$.map( e => e.newGameResult.place   ).distinctUntilChanged(),
    memo$    : this.myRandomizerGroup$.map( e => e.newGameResult.memo    ).distinctUntilChanged(),
  };
  lastTurnPlayerName$        = this.myRandomizerGroup$.map( e => e.lastTurnPlayerName        ).distinctUntilChanged();
  newGameResultDialogOpened$ = this.myRandomizerGroup$.map( e => e.newGameResultDialogOpened ).distinctUntilChanged();
  resetVPCalculator$         = this.myRandomizerGroup$.map( e => e.resetVPCalculator         ).distinctUntilChanged();

  selectedCardsHistory$ = this.myRandomizerGroup$.map( e => e.selectedCardsHistory ).distinctUntilChanged();


  constructor(
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
    this.myUserInfo.randomizerGroupID$
      .subscribe( val => this.myRandomizerGroupID = val );
  }




  async addToSelectedCardsHistory( newSelectedCards: SelectedCards ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
      .add.selectedCardsHistory( this.myRandomizerGroupID, {
              selectedCards: newSelectedCards,
              timeStamp: Date.now(),
            } );
  }


  async setRandomizerButtonLocked( locked: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.randomizerButtonLocked( this.myRandomizerGroupID, locked );
  }

  async setIsSelectedExpansions( index: number, value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.isSelectedExpansions( this.myRandomizerGroupID, index, value );
  }

  async setSelectedCards( newSelectedCards: SelectedCards ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.selectedCards( this.myRandomizerGroupID, newSelectedCards );
  }

  async setSelectedCardsCheckbox( arrayName: string, index: number, value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.selectedCardsCheckbox( this.myRandomizerGroupID, arrayName, index, value );
  }

  async resetSelectedCards() {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .reset.selectedCards( this.myRandomizerGroupID );
  }

  async resetSelectedCardsCheckbox() {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .reset.selectedCardsCheckbox( this.myRandomizerGroupID );
  }

  async setBlackMarketPileShuffled( BlackMarketPileShuffled: BlackMarketPileCard[] ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.BlackMarketPileShuffled( this.myRandomizerGroupID, BlackMarketPileShuffled );
  }

  async setBlackMarketPhase( BlackMarketPhase: number ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.BlackMarketPhase( this.myRandomizerGroupID, BlackMarketPhase );
  }

  async resetVPCalculator() {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup.reset.VPCalculator( this.myRandomizerGroupID );
  }

  async setLastTurnPlayerName( value: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.lastTurnPlayerName( this.myRandomizerGroupID, value );
  }

  async setNewGameResultPlayerSelected( uid: string, value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.players.selected( this.myRandomizerGroupID, uid, value );
  }

  async setNewGameResultPlayerVP( uid: string, value: number ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.players.VP( this.myRandomizerGroupID, uid, value );
  }

  async setNewGameResultPlayerTurnOrder( uid: string, value: number ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.players.turnOrder( this.myRandomizerGroupID, uid, value );
  }

  async setNewGameResultPlace( value: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.place( this.myRandomizerGroupID, value );
  }

  async setNewGameResultMemo( value: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.memo( this.myRandomizerGroupID, value );
  }

  async setNewGameResultDialogOpened( value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResultDialogOpened( this.myRandomizerGroupID, value );
  }


  async addMember( groupID: string, uid: string, name: string ) {
    await this.signedIn$.first().toPromise();
    const value = new PlayerResult( uid, {
              name      : name,
              selected  : false,
              VP        : 0,
              turnOrder : 0,
            });
    return this.database.randomizerGroup.add.member( groupID, uid, value );
  }


  async removeMember( groupID: string, uid: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup.remove.member( groupID, uid );
  }



}
