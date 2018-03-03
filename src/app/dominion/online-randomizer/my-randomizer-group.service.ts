import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { switchMap, switchMapTo } from 'rxjs/operators';

import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { MyUserInfoService } from '../../firebase-mediator/my-user-info.service';

import { RandomizerGroup       } from '../../classes/online-randomizer/randomizer-group';
import { SelectedCards         } from '../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../classes/black-market-pile-card';
import { BlackMarketPhase      } from '../../classes/online-randomizer/black-market-phase.enum';
import { PlayerResult          } from '../../classes/online-randomizer/player-result';
import { NumberOfVictoryCards } from '../../classes/number-of-victory-cards';


@Injectable()
export class MyRandomizerGroupService {
  private myGrpId$: Observable<string>
    = this.myUserInfo.randomizerGroupId$;
  private myGrpId: string = '';
  private myGrpIdIsReadySource = new Subject<void>();
  private myGrpIdIsReady$ = this.myGrpIdIsReadySource.asObservable();

  /**
   * [ToDo] listから自分のグループのみ取り出しているが，
   * idを取得後にfiredatabaseに自分のグループだけ問い合わせるように変更すべき
   */
  private myGrp$: Observable<RandomizerGroup>
   = Observable.combineLatest(
        this.database.randomizerGroupList$,
        this.myGrpId$,
        (list, id) => list.find( e => e.databaseKey === id ) || new RandomizerGroup() )
      .distinctUntilChanged( this.cmpObj );


  name$ = this.myGrp$.map( e => e.name ).distinctUntilChanged();


  /**
   * myRandomizerGroupのisSelectedExpansionsを取り出せば良いが，
   * 初期化されていないときにはexpansionNameListの長さのfalseの配列で初期化する必要がある．
   */
  isSelectedExpansions$: Observable<boolean[]>
    = Observable.combineLatest(
        this.database.expansionNameList$.map( list => list.map( _ => false ) ),
        this.myGrp$.map( e => e.isSelectedExpansions ).distinctUntilChanged( this.cmpObj ),
        (initArray, isSelectedExpansions) =>
          initArray.map( (_, i) => !!isSelectedExpansions[i] ) );


  selectedCardsCheckbox$: Observable<SelectedCardsCheckbox>
    = this.myGrp$.map( e => e.selectedCardsCheckbox )
        .distinctUntilChanged( this.cmpObj );

  BlackMarketPileShuffled$: Observable<BlackMarketPileCard[]>
    = this.myGrp$.map( e => e.BlackMarketPileShuffled )
        .distinctUntilChanged( this.cmpObj );
  BlackMarketPhase$: Observable<BlackMarketPhase>
    = this.myGrp$.map( e => e.BlackMarketPhase )
        .distinctUntilChanged();

  selectedCardsHistory$: Observable<SelectedCards[]>
    = this.myGrp$.map( e => e.selectedCardsHistory )
        .distinctUntilChanged( this.cmpObj );
  selectedIndexInHistory$: Observable<number>
    = this.myGrp$.map( e => e.selectedIndexInHistory )
        .distinctUntilChanged( this.cmpObj );

  selectedCards$: Observable<SelectedCards>
   = Observable.combineLatest(
      this.selectedCardsHistory$,
      this.selectedIndexInHistory$,
      (list, index) => list[index] || new SelectedCards() );

  newGameResult: {
    players$:            Observable<PlayerResult[]>,
    place$:              Observable<string>,
    memo$:               Observable<string>,
    lastTurnPlayerName$: Observable<string>,
  } = {
    players$ :
      this.myGrp$.map( e => e.newGameResult.players )
        .distinctUntilChanged( this.cmpObj ),
    place$ :
      this.myGrp$.map( e => e.newGameResult.place )
        .distinctUntilChanged(),
    memo$ :
      this.myGrp$.map( e => e.newGameResult.memo )
        .distinctUntilChanged(),
    lastTurnPlayerName$ :
      this.myGrp$.map( e => e.newGameResult.lastTurnPlayerName )
        .distinctUntilChanged(),
  };

  newGameResultDialogOpened$: Observable<boolean>
    = this.myGrp$.map( e => e.newGameResultDialogOpened )
        .distinctUntilChanged();
  resetVPCalculator$: Observable<number>
    = this.myGrp$.map( e => e.resetVPCalculator )
        .distinctUntilChanged();



  constructor(
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService
  ) {
    // this.myGrp$.subscribe( val => console.log('myGrp$', val ) );

    this.myGrpId$.subscribe( val => {
        this.myGrpId = val;
        this.myGrpIdIsReadySource.complete();
      });
  }


  private cmpObj(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
  }



  async setIsSelectedExpansions( index: number, value: boolean ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.isSelectedExpansions( this.myGrpId, index, value );
  }

  async addToHistory( newSelectedCards: SelectedCards ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .add.selectedCardsHistory(
              this.myGrpId, newSelectedCards );
  }

  async setSelectedIndexInHistory( index: number ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.selectedIndexInHistory(
                this.myGrpId, index );
  }

  async setBMPileShuffled( shuffled: BlackMarketPileCard[] ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.BlackMarketPileShuffled( this.myGrpId, shuffled );
  }

  async setBlackMarketPhase( phase: number ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.BlackMarketPhase( this.myGrpId, phase );
  }

  async setSelectedCardsCheckbox( arrayName: string, index: number, value: boolean ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.selectedCardsCheckbox(
              this.myGrpId, arrayName, index, value );
  }

  async resetSelectedCardsCheckbox() {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .reset.selectedCardsCheckbox( this.myGrpId );
  }



  async setNGRLastTurnPlayerName( value: string ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResult.lastTurnPlayerName( this.myGrpId, value );
  }

  async setNGRPlayerSelected( uid: string, value: boolean ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResult.players.selected( this.myGrpId, uid, value );
  }

  async setNGRPlayerVP( uid: string, value: number ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResult.players.VP( this.myGrpId, uid, value );
  }

  async setNGRPlayerNumberOfVictoryCards( uid: string, value: NumberOfVictoryCards ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResult.players.numberOfVictoryCards( this.myGrpId, uid, value );
  }

  async setNGRPlayersTurnOrder( uid: string, value: number ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResult.players.turnOrder( this.myGrpId, uid, value );
  }

  async setNGRPlace( value: string ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResult.place( this.myGrpId, value );
  }

  async setNGRMemo( value: string ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResult.memo( this.myGrpId, value );
  }


  async resetVPCalculator() {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup.reset.VPCalculator( this.myGrpId );
  }

  async setNGRDialogOpened( value: boolean ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup
            .set.newGameResultDialogOpened( this.myGrpId, value );
  }


  async addMember( groupId: string, uid: string, name: string, nameYomi: string ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    const value = new PlayerResult( uid, {
              name      : name,
              nameYomi  : nameYomi,
              selected  : false,
              VP        : 0,
              turnOrder : 0,
              numberOfVictoryCards: new NumberOfVictoryCards(),
            });
    return this.database.randomizerGroup.add.member( groupId, uid, value );
  }

  async removeMember( groupId: string, uid: string ) {
    await this.myGrpIdIsReady$.toPromise();
    if ( !this.myGrpId ) return Promise.resolve();
    return this.database.randomizerGroup.remove.member( groupId, uid );
  }
}
