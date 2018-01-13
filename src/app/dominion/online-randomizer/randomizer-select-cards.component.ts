import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { MatDialog } from '@angular/material';

import { UtilitiesService              } from '../../my-own-library/utilities.service';
import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';
import { MyRandomizerGroupService      } from './my-randomizer-group.service';

import { SelectedCards         } from '../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../classes/black-market-pile-card';
import { BlackMarketPhase      } from '../../classes/black-market-phase.enum';

import { CardPropertyDialogComponent } from '../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-randomizer-select-cards',
  template: `
    <app-randomizer
      [(randomizerButtonLocked)]="randomizerButtonLocked"
      (randomizerButtonLockedChange)="randomizerButtonLockedOnChange( $event )"
      [isSelectedExpansions]="isSelectedExpansions"
      (isSelectedExpansionsPartEmitter)="isSelectedExpansionsOnChange( $event )"
      [selectedCards]="selectedCards"
      (selectedCardsChange)="selectedCardsChanged( $event )"
      (BlackMarketPileShuffledChange)="BlackMarketPileShuffledOnChange( $event )"
      showSelectedCardsCheckbox="true"
      [selectedCardsCheckbox]="selectedCardsCheckbox"
      (selectedCardsCheckboxPartEmitter)="selectedCardsCheckboxOnChange( $event )"
      (selectedCardsCheckboxOnReset)="selectedCardsCheckboxOnReset()"
      [undoable]="undoable$ | async"
      [redoable]="redoable$ | async"
      (undoClicked)="undo()"
      (redoClicked)="redo()"
      (resetClicked)="resetClicked()"
      >
    </app-randomizer>
  `,
  styles: []
})
export class RandomizerSelectCardsComponent implements OnInit, OnDestroy {
  private alive = true;
  randomizerButtonLocked = false;
  isSelectedExpansions: boolean[] = [];
  selectedCards: SelectedCards = new SelectedCards();
  selectedCardsCheckbox = new SelectedCardsCheckbox();
  selectedCardsHistory: { selectedCards: SelectedCards, date: Date }[] = [];
  private BlackMarketPileShuffled: BlackMarketPileCard[] = [];

  private historyRefIndexSource = new BehaviorSubject<number>(0);
  historyRefIndex$: Observable<number> = this.historyRefIndexSource.asObservable();
  historyRefIndex: number = 0;
  undoable$: Observable<boolean>;
  redoable$: Observable<boolean>;


  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    private database: CloudFirestoreMediatorService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    this.undoable$ = Observable.combineLatest(
      this.historyRefIndex$,
      this.myRandomizerGroup.selectedCardsHistory$.map( e => e.length ),
      (index, length) => (length > 0 && 0 < index) );

    this.redoable$ = Observable.combineLatest(
      this.historyRefIndex$,
      this.myRandomizerGroup.selectedCardsHistory$.map( e => e.length ),
      (index, length) => (length > 0 && index < length - 1) );


    /* subscriptions */

    this.myRandomizerGroup.selectedCardsHistory$
      .map( e => e.length - 1 ).distinctUntilChanged()
      .takeWhile( () => this.alive )
      .subscribe( val => this.historyRefIndexSource.next( val ) );

    this.myRandomizerGroup.randomizerButtonLocked$
      .takeWhile( () => this.alive )
      .subscribe( val => this.randomizerButtonLocked = val );

    this.myRandomizerGroup.isSelectedExpansions$
      .takeWhile( () => this.alive )
      .subscribe( val => this.isSelectedExpansions = val );

    this.myRandomizerGroup.selectedCards$
      .takeWhile( () => this.alive )
      .subscribe( val => this.selectedCards = val );

    this.myRandomizerGroup.selectedCardsCheckbox$
      .takeWhile( () => this.alive )
      .subscribe( val => this.selectedCardsCheckbox = val );

    this.myRandomizerGroup.selectedCardsHistory$
      .takeWhile( () => this.alive )
      .subscribe( val => this.selectedCardsHistory = val );

    this.myRandomizerGroup.BlackMarketPileShuffled$
      .takeWhile( () => this.alive )
      .subscribe( val => this.BlackMarketPileShuffled = val );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }



  selectedCardsOnChange( selectedCards: SelectedCards ) {
    this.selectedCards = new SelectedCards( selectedCards );
    this.myRandomizerGroup.setSelectedCards( this.selectedCards );
    this.myRandomizerGroup.setBlackMarketPhase( BlackMarketPhase.init );
    this.myRandomizerGroup.resetVPCalculator();
  }

  private restoreFromHistory( index: number ) {
    this.selectedCardsOnChange( this.selectedCardsHistory[ index ].selectedCards );
    const BlackMarketPileShuffled
      = this.selectedCards.BlackMarketPile.map( e => ({ cardIndex: e, faceUp: false }) );
    this.myRandomizerGroup.setBlackMarketPileShuffled( BlackMarketPileShuffled );
  }



  /* react to app-randomizer */

  resetClicked() {
    this.historyRefIndexSource.next( this.selectedCardsHistory.length );
    this.myRandomizerGroup.setBlackMarketPhase( BlackMarketPhase.init );
  }

  undo() {
    const newIndex = this.historyRefIndexSource.value - 1;
    this.historyRefIndexSource.next( newIndex );
    this.restoreFromHistory( newIndex );
  }

  redo() {
    const newIndex = this.historyRefIndexSource.value + 1;
    this.historyRefIndexSource.next( newIndex );
    this.restoreFromHistory( newIndex );
  }

  randomizerButtonLockedOnChange( lock: boolean ) {
    this.myRandomizerGroup.setRandomizerButtonLocked( lock );
  }

  isSelectedExpansionsOnChange( value: { index: number, checked: boolean } ) {
    this.myRandomizerGroup.setIsSelectedExpansions( value.index, value.checked );
  }

  selectedCardsChanged( selectedCards: SelectedCards ) {
    this.selectedCardsOnChange( selectedCards );
    if ( this.selectedCards.KingdomCards10.length > 0 ) {
      this.myRandomizerGroup.addToSelectedCardsHistory( this.selectedCards );
    }
  }

  BlackMarketPileShuffledOnChange( value: BlackMarketPileCard[] ) {
    this.myRandomizerGroup.setBlackMarketPileShuffled( value );
    this.myRandomizerGroup.setBlackMarketPhase( BlackMarketPhase.init );
  }

  selectedCardsCheckboxOnChange( value: { category: string, index: number, checked: boolean } ) {
    return this.myRandomizerGroup.setSelectedCardsCheckbox( value.category, value.index, value.checked );
  }

  selectedCardsCheckboxOnReset() {
    return this.myRandomizerGroup.resetSelectedCardsCheckbox();
  }


}
