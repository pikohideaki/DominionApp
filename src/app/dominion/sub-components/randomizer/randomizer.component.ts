import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { MatDialog } from '@angular/material';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { RandomizerService } from './randomizer.service';

import { AlertDialogComponent   } from '../../../my-own-library/alert-dialog.component';
import { ConfirmDialogComponent } from '../../../my-own-library/confirm-dialog.component';

import { CardPropertyDialogComponent } from '../card-property-dialog/card-property-dialog.component';

import { CardProperty          } from '../../../classes/card-property';
import { SelectedCards         } from '../../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../../classes/black-market-pile-card';


@Component({
  providers: [RandomizerService],
  selector: 'app-randomizer',
  templateUrl: './randomizer.component.html',
  styleUrls: [
    '../../../my-own-library/data-table/data-table.component.css',
    './randomizer.component.css'
  ]
})
export class RandomizerComponent implements OnInit {

  /* settings */
  @Input() showSelectedCardsCheckbox: boolean = false;
  @Input() implementedOnly: boolean = false;
  @Input() undoable: boolean = true;
  @Input() redoable: boolean = true;

  @Input() private confirmUnlock: boolean = false;
  @Input() private confirmMessage: string = '';


  @Input()  randomizerButtonLocked: boolean;
  @Output() randomizerButtonLockedChange = new EventEmitter<boolean>();

  @Output() undoClicked = new EventEmitter<void>();
  @Output() redoClicked = new EventEmitter<void>();

  @Input()  isSelectedExpansions: boolean[] = [];
  @Output() isSelectedExpansionsPartEmitter
    = new EventEmitter<{ index: number, checked: boolean }>();

  @Input()  selectedCards: SelectedCards;
  @Output() selectedCardsChange = new EventEmitter<SelectedCards>();

  @Input()  selectedCardsCheckbox: SelectedCardsCheckbox
    = new SelectedCardsCheckbox();
  @Output() selectedCardsCheckboxPartEmitter
    = new EventEmitter<{ category: string, index: number, checked: boolean }>();
  @Output() selectedCardsCheckboxOnReset = new EventEmitter<void>();

  @Input()  BlackMarketPileShuffled: BlackMarketPileCard[] = [];
  @Output() BlackMarketPileShuffledChange
    = new EventEmitter<BlackMarketPileCard[]>();



  constructor(
    private utils: UtilitiesService,
    public dialog: MatDialog,
    private randomizer: RandomizerService,
  ) {
  }

  ngOnInit() {
  }


  private setRandomizerButtonLocked( value: boolean ) {
    this.randomizerButtonLocked = value;
    this.randomizerButtonLockedChange.emit( value );
  }


  undoOnClick() {
    this.undoClicked.emit();
  }

  redoOnClick() {
    this.redoClicked.emit();
  }

  unlockRandomizerButton() {
    if ( !this.confirmUnlock ) {
      this.setRandomizerButtonLocked( false );
    } else {
      const dialogRef = this.dialog.open( ConfirmDialogComponent );
      dialogRef.componentInstance.message = this.confirmMessage;
      dialogRef.afterClosed().filter( result => result === 'yes' )
          .subscribe( () => this.setRandomizerButtonLocked( false ) );
    }
  }


  selectedCardsCheckboxOnChange( value: { category: string, index: number, checked: boolean } ) {
    this.selectedCardsCheckboxPartEmitter.emit( value );
  }

  expansionToggleOnChange( value: { index: number, checked: boolean } ) {
    this.isSelectedExpansionsPartEmitter.next( value );
  }

  expansionsToggleIsEmpty(): boolean {
    return this.isSelectedExpansions.every( selected => !selected );
  }


  resetSelectedCards() {
    this.setRandomizerButtonLocked(false);

    this.selectedCards = new SelectedCards();
    this.selectedCardsChange.emit( this.selectedCards );

    this.selectedCardsCheckbox.clear();
    this.selectedCardsCheckboxOnReset.emit();

    this.BlackMarketPileShuffledChange.emit( [] );
  }



  randomizerClicked() {
    if ( this.expansionsToggleIsEmpty() ) return;

    this.setRandomizerButtonLocked(true);

    const result = this.randomizer.selectCards( this.implementedOnly, this.isSelectedExpansions );
    if ( !result.valid ) {
      const dialogRef = this.dialog.open( AlertDialogComponent );
      dialogRef.componentInstance.message = `サプライが足りません．セットの選択数を増やしてください．`;
      return;
    }

    this.selectedCards = new SelectedCards( result.selectedCards );
    this.selectedCardsChange.emit( this.selectedCards );

    this.selectedCardsCheckbox.clear();
    this.selectedCardsCheckboxOnReset.emit();

    const BlackMarketPileShuffled
      = this.utils.getShuffled( this.selectedCards.BlackMarketPile )
                  .map( e => ({ cardIndex: e, faceUp: false }) );
    this.BlackMarketPileShuffledChange.emit( BlackMarketPileShuffled );
  }

}
