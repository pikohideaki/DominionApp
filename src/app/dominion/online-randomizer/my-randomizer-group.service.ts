import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';


import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';

import { RandomizerGroup       } from '../../classes/randomizer-group';
import { SelectedCards         } from '../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../classes/black-market-pile-card';
import { PlayerResult          } from '../../classes/player-result';


@Injectable()
export class MyRandomizerGroupService {
  private myRandomizerGroupId: string = '';

  private myRandomizerGroup$: Observable<RandomizerGroup>
   = Observable.combineLatest(
      this.database.randomizerGroupList$,
      this.myUserInfo.randomizerGroupId$,
      (list, id) => (list.find( e => e.databaseKey === id ) || new RandomizerGroup() ) );

  private signedIn$: Observable<boolean> = this.myUserInfo.signedIn$;


  name$                      = this.myRandomizerGroup$.map( e => e.name                      ).distinctUntilChanged();
  randomizerButtonLocked$    = this.myRandomizerGroup$.map( e => e.randomizerButtonLocked    ).distinctUntilChanged();
  isSelectedExpansions$
    = Observable.combineLatest(
        this.database.expansionsNameList$.map( list => list.map( _ => false ) ),
        this.myRandomizerGroup$.map( e => e.isSelectedExpansions )
                .distinctUntilChanged( this.cmpObj )
                .startWith([]),
        (initArray, isSelectedExpansions) =>
          initArray.map( (_, i) => !!isSelectedExpansions[i] ) );

  selectedCards$             = this.myRandomizerGroup$.map( e => e.selectedCards             ).distinctUntilChanged( this.cmpObj );
  selectedCardsCheckbox$     = this.myRandomizerGroup$.map( e => e.selectedCardsCheckbox     ).distinctUntilChanged( this.cmpObj );
  BlackMarketPileShuffled$   = this.myRandomizerGroup$.map( e => e.BlackMarketPileShuffled   ).distinctUntilChanged( this.cmpObj );
  BlackMarketPhase$          = this.myRandomizerGroup$.map( e => e.BlackMarketPhase          ).distinctUntilChanged();
  newGameResult = {
    players$ : this.myRandomizerGroup$.map( e => e.newGameResult.players ).distinctUntilChanged( this.cmpObj ),
    place$   : this.myRandomizerGroup$.map( e => e.newGameResult.place   ).distinctUntilChanged(),
    memo$    : this.myRandomizerGroup$.map( e => e.newGameResult.memo    ).distinctUntilChanged(),
  };
  lastTurnPlayerName$        = this.myRandomizerGroup$.map( e => e.lastTurnPlayerName        ).distinctUntilChanged();
  newGameResultDialogOpened$ = this.myRandomizerGroup$.map( e => e.newGameResultDialogOpened ).distinctUntilChanged();
  resetVPCalculator$         = this.myRandomizerGroup$.map( e => e.resetVPCalculator         ).distinctUntilChanged();

  selectedCardsHistory$ = this.myRandomizerGroup$.map( e => e.selectedCardsHistory ).distinctUntilChanged( this.cmpObj );


  constructor(
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
    this.myUserInfo.randomizerGroupId$
      .subscribe( val => this.myRandomizerGroupId = val );
  }


  cmpObj(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
  }


  async addToSelectedCardsHistory( newSelectedCards: SelectedCards ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
      .add.selectedCardsHistory( this.myRandomizerGroupId, {
              selectedCards: newSelectedCards,
              timeStamp: Date.now(),
            } );
  }


  async setRandomizerButtonLocked( locked: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.randomizerButtonLocked( this.myRandomizerGroupId, locked );
  }

  async setIsSelectedExpansions( index: number, value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.isSelectedExpansions( this.myRandomizerGroupId, index, value );
  }

  async setSelectedCards( newSelectedCards: SelectedCards ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.selectedCards( this.myRandomizerGroupId, newSelectedCards );
  }

  async setSelectedCardsCheckbox( arrayName: string, index: number, value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.selectedCardsCheckbox( this.myRandomizerGroupId, arrayName, index, value );
  }

  async resetSelectedCards() {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .reset.selectedCards( this.myRandomizerGroupId );
  }

  async resetSelectedCardsCheckbox() {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .reset.selectedCardsCheckbox( this.myRandomizerGroupId );
  }

  async setBlackMarketPileShuffled( BlackMarketPileShuffled: BlackMarketPileCard[] ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.BlackMarketPileShuffled( this.myRandomizerGroupId, BlackMarketPileShuffled );
  }

  async setBlackMarketPhase( BlackMarketPhase: number ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.BlackMarketPhase( this.myRandomizerGroupId, BlackMarketPhase );
  }

  async resetVPCalculator() {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup.reset.VPCalculator( this.myRandomizerGroupId );
  }

  async setLastTurnPlayerName( value: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.lastTurnPlayerName( this.myRandomizerGroupId, value );
  }

  async setNewGameResultPlayerSelected( uid: string, value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.players.selected( this.myRandomizerGroupId, uid, value );
  }

  async setNewGameResultPlayerVP( uid: string, value: number ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.players.VP( this.myRandomizerGroupId, uid, value );
  }

  async setNewGameResultPlayerTurnOrder( uid: string, value: number ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.players.turnOrder( this.myRandomizerGroupId, uid, value );
  }

  async setNewGameResultPlace( value: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.place( this.myRandomizerGroupId, value );
  }

  async setNewGameResultMemo( value: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResult.memo( this.myRandomizerGroupId, value );
  }

  async setNewGameResultDialogOpened( value: boolean ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup
            .set.newGameResultDialogOpened( this.myRandomizerGroupId, value );
  }


  async addMember( groupId: string, uid: string, name: string ) {
    await this.signedIn$.first().toPromise();
    const value = new PlayerResult( uid, {
              name      : name,
              selected  : false,
              VP        : 0,
              turnOrder : 0,
            });
    return this.database.randomizerGroup.add.member( groupId, uid, value );
  }


  async removeMember( groupId: string, uid: string ) {
    await this.signedIn$.first().toPromise();
    return this.database.randomizerGroup.remove.member( groupId, uid );
  }



}
