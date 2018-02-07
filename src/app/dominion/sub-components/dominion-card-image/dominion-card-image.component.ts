import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { CardProperty } from '../../../classes/card-property';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
  selector: 'app-dominion-card-image',
  templateUrl: './dominion-card-image.component.html',
  styleUrls: ['./dominion-card-image.component.css']
})
export class DominionCardImageComponent implements OnInit, OnChanges {

  @Output() private cardClicked = new EventEmitter<void>();

  @Input() description: string = '';

  @Input() card:     CardProperty = new CardProperty();
  @Input() width:    number;
  @Input() height:   number;
  @Input() faceUp:   boolean;
  @Input() isButton: boolean;
  @Input() empty:    boolean;
  private cardSource     = new BehaviorSubject<CardProperty>( new CardProperty() );
  private widthSource    = new BehaviorSubject<number>(0);
  private faceUpSource   = new BehaviorSubject<boolean>(true);
  private isButtonSource = new BehaviorSubject<boolean>(false);
  private emptySource    = new BehaviorSubject<boolean>(false);
  card$     = this.cardSource    .asObservable();
  width$    = this.widthSource   .asObservable().distinctUntilChanged();
  faceUp$   = this.faceUpSource  .asObservable().distinctUntilChanged();
  isButton$ = this.isButtonSource.asObservable().distinctUntilChanged();
  empty$    = this.emptySource   .asObservable().distinctUntilChanged();

  height$: Observable<number>  // widthから計算
   = Observable.combineLatest(
        this.card$, this.width$,
        (card, width) =>
          ( card.isWideType() ? width * (15 / 23)
                              : width * (23 / 15) ) )
      .distinctUntilChanged();

  borderWidth$:  Observable<number>
    = Observable.combineLatest(
        this.width$, this.height$,
        (width, height) => (18 / 250) * Math.min( width, height ) );

  borderRadius$: Observable<number> = this.borderWidth$;

  sourceDir$: Observable<string>;


  constructor(
  ) {
    // this.card$.subscribe( val => console.log( this.description, val ) );
    const CARD_IMAGE_DIR = 'assets/img/card';
    this.sourceDir$ = Observable.combineLatest(
      this.empty$, this.faceUp$, this.card$,
      (empty, faceUp, card) => {
        if ( empty ) return 'assets/img/blank.png';
        if ( !faceUp ) {
          if ( card.cardTypes.includes('Boon') ) return `${CARD_IMAGE_DIR}/Boon-back.jpg`;
          if ( card.cardTypes.includes('Hex' ) ) return `${CARD_IMAGE_DIR}/Hex-back.jpg`;
          if ( card.cardId === 'Stash' )         return `${CARD_IMAGE_DIR}/Stash-back.jpg`;
          return `${CARD_IMAGE_DIR}/Card_back.jpg`;
        }
        return `${CARD_IMAGE_DIR}/${this.card.nameEng.replace( / /g , '_' )}.jpg`;
      } );
  }


  ngOnChanges( changes: SimpleChanges ) {
    // console.log(changes);
    if ( changes.card !== undefined
          && changes.card.currentValue !== undefined ) {
      this.cardSource.next( changes.card.currentValue || new CardProperty() );
    }
    if ( changes.width !== undefined
          && changes.width.currentValue !== undefined ) {
      this.widthSource.next( changes.width.currentValue || 0 );
    }
    if ( changes.height !== undefined
          && changes.height.currentValue !== undefined ) {
      this.widthSource.next( this.widthFromHeight( changes.height.currentValue ) );
    }
    if ( changes.faceUp !== undefined
         && changes.faceUp.currentValue !== undefined ) {
      this.faceUpSource.next( changes.faceUp.currentValue || false );
    }
    if ( changes.isButton !== undefined
         && changes.isButton.currentValue !== undefined ) {
      this.isButtonSource.next( changes.isButton.currentValue || false );
    }
    if ( changes.empty !== undefined
         && changes.empty.currentValue !== undefined ) {
      this.emptySource.next( changes.empty.currentValue || false );
    }
  }

  ngOnInit() {
    this.cardSource    .next( this.card     );
    this.faceUpSource  .next( this.faceUp   );
    this.isButtonSource.next( this.isButton );
    this.emptySource   .next( this.empty    );
    if ( this.width !== undefined ) {
      this.widthSource.next( this.width );
    } else if ( this.height !== undefined ) {
      this.widthSource.next( this.widthFromHeight( this.height ) );
    } else {
      console.error(`width or height must be given`);
    }
  }


  private widthFromHeight( height ) {
    const card = this.cardSource.getValue();
    return ( card.isWideType() ? height * (23 / 15) : height * (15 / 23) );
  }

  onClicked() {
    if ( this.isButton ) {
      this.cardClicked.emit();
    }
  }
}
