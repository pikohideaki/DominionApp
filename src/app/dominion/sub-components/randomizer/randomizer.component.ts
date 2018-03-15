import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material';

import { utils } from '../../../my-own-library/utilities';
import { RandomizerService } from './randomizer.service';

import { AlertDialogComponent   } from '../../../my-own-library/alert-dialog.component';
import { ConfirmDialogComponent } from '../../../my-own-library/confirm-dialog.component';


import { CardProperty          } from '../../../classes/card-property';
import { SelectedCards         } from '../../../classes/selected-cards';
import { SelectedCardsCheckbox } from '../../../classes/selected-cards-checkbox-values';
import { BlackMarketPileCard   } from '../../../classes/black-market-pile-card';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


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
  @Input() useHistory: boolean = true;
  @Input() implementedOnly: boolean = false;


  /* 拡張セット */
  @Input()  isSelectedExpansions$: Observable<boolean[]>;
  @Output() isSelectedExpansionsPartEmitter
    = new EventEmitter<{ index: number, checked: boolean }>();
  expansionsToggleIsEmpty$: Observable<boolean>;


  // history 使わない場合
  @Input()  selectedCards$: Observable<SelectedCards>;  // option
  @Output() selectedCardsChange = new EventEmitter<SelectedCards>();

  // history 使う場合
  @Input()  selectedCardsHistory$: Observable<SelectedCards[]>;  // option
  @Input()  selectedIndexInHistory$: Observable<number>;  // option
  @Output() selectedIndexInHistoryChange = new EventEmitter<number>();
  @Output() selectedCardsAdded = new EventEmitter<SelectedCards>();

  // historyを使うかどうかによって入力を切り替えたselectedCards$
  selectedCardsLocal$: Observable<SelectedCards>;


  @Input()  BlackMarketPileShuffled$: Observable<BlackMarketPileCard[]>;  // option
  @Output() BlackMarketPileShuffledChange
    = new EventEmitter<BlackMarketPileCard[]>();

  /* checkbox values */
  @Input()  selectedCardsCheckbox$: Observable<SelectedCardsCheckbox>;  // option
  @Output() selectedCardsCheckboxPartEmitter
    = new EventEmitter<{ category: string, index: number, checked: boolean }>();
  @Output() selectedCardsCheckboxOnReset = new EventEmitter<void>();

  // randomizerButton 連打防止
  private randomizerButtonClickedSource = new EventEmitter<void>();
  private randomizerButtonClicked$ = this.randomizerButtonClickedSource.asObservable();
  randomizerButtonLocked$: Observable<boolean>
    = Observable.merge(
        this.randomizerButtonClicked$.map( _ => true ),
        this.randomizerButtonClicked$.delay(500).map( _ => false ) )
      .startWith(false);

  // historyは時刻降順，0が最新
  undoable$: Observable<boolean>;
  redoable$: Observable<boolean>;



  constructor(
    public dialog: MatDialog,
    private randomizer: RandomizerService,
  ) {
  }

  ngOnInit() {
    if ( this.selectedCards$ === undefined ) {
      this.selectedCards$ = Observable.of( new SelectedCards() );
    }
    if ( this.selectedCardsHistory$ === undefined ) {
      this.selectedCardsHistory$ = Observable.of([]);
    }
    if ( this.selectedIndexInHistory$ === undefined ) {
      this.selectedIndexInHistory$ = Observable.of(0);
    }
    if ( this.BlackMarketPileShuffled$ === undefined ) {
      this.BlackMarketPileShuffled$ = Observable.of([]);
    }
    if ( this.selectedCardsCheckbox$ === undefined ) {
      this.selectedCardsCheckbox$ = Observable.of( new SelectedCardsCheckbox() );
    }

    this.selectedCardsLocal$
      = ( !this.useHistory
            ? this.selectedCards$
            : Observable.combineLatest(
                  this.selectedCardsHistory$,
                  this.selectedIndexInHistory$,
                  (list, index) => list[ index ] || new SelectedCards() )
                .startWith( new SelectedCards() ) );

    this.expansionsToggleIsEmpty$
      = this.isSelectedExpansions$.map( val => val.every( e => !e ) )
        .startWith( true );

    this.undoable$ = Observable.combineLatest(
        this.selectedIndexInHistory$,
        this.selectedCardsHistory$,
        (index, history) => history.length > 0 && utils.number.isInRange( index, -1, history.length - 1 ) );

    this.redoable$ = Observable.combineLatest(
        this.selectedIndexInHistory$,
        this.selectedCardsHistory$,
        (index, history) => history.length > 0 && utils.number.isInRange( index, 1, history.length ) );
  }


  undoOnClick( currentIndex: number, history: SelectedCards[] ) {
    this.changeHistoryIndex( currentIndex + 1, history );
  }

  redoOnClick( currentIndex: number, history: SelectedCards[] ) {
    this.changeHistoryIndex( currentIndex - 1, history );
  }

  resetOnClick() {
    this.changeHistoryIndex( -1 );
  }

  randomizerButtonOnClick( isSelectedExpansions, history: SelectedCards[] ) {
    this.randomizerButtonClickedSource.emit();
    this.randomizerSelectCards( isSelectedExpansions, history );
  }

  selectedCardsCheckboxOnChange(
    value: { category: string, index: number, checked: boolean }
  ) {
    this.selectedCardsCheckboxPartEmitter.emit( value );
  }

  expansionToggleOnChange( value: { index: number, checked: boolean } ) {
    this.isSelectedExpansionsPartEmitter.next( value );
  }


  private changeHistoryIndex( index: number, history: SelectedCards[] = [] ) {
    this.selectedIndexInHistoryChange.emit( index );
    this.selectedCardsCheckboxOnReset.emit();
    const selectedCards = ( history[ index ] || new SelectedCards() );
    this.selectedCardsChange.emit( selectedCards );
    const BlackMarketPileShuffled
      = utils.number.random.getShuffled( selectedCards.BlackMarketPile )
                  .map( e => ({ cardIndex: e, faceUp: false }) );
    this.BlackMarketPileShuffledChange.emit( BlackMarketPileShuffled );
  }

  private randomizerSelectCards( isSelectedExpansions, history: SelectedCards[] ) {
    const result = this.randomizer.selectCards(
                          this.implementedOnly,
                          isSelectedExpansions );

    if ( !result.valid ) {
      const dialogRef = this.dialog.open( AlertDialogComponent );
      dialogRef.componentInstance.message
        = `サプライが足りません．セットの選択数を増やしてください．`;
      return;
    } else {
      this.selectedCardsAdded.emit( result.selectedCards );
      this.changeHistoryIndex( 0, [ result.selectedCards, ...history ] );
    }
  }
}
