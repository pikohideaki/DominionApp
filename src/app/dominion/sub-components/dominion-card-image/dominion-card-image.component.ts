import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { CardProperty } from '../../../classes/card-property';

@Component({
  selector: 'app-dominion-card-image',
  templateUrl: './dominion-card-image.component.html',
  styleUrls: ['./dominion-card-image.component.css']
})
export class DominionCardImageComponent implements OnInit, OnChanges {

  private CARD_IMAGE_DIR = 'assets/img/card';

  sourceDir: string;

  @Input() private card: CardProperty = new CardProperty();
  @Input() faceUp:      boolean;
  @Input() width:       number;
  @Input() height:      number;
  @Input() isButton:    boolean = false;
  @Input() description: string = '';
  @Input() empty:       boolean = false;

  @Output() private cardClicked = new EventEmitter<void>();

  borderWidth: number;
  borderRadius: number;

  /* 設定されたもののうち一方からもう一方を計算．
     Input要素の書き換えを避けるためコピー． */
  widthDerived:  number;
  heightDerived: number;


  constructor(
  ) { }

  ngOnChanges( changes ) {
    if ( this.width  !== undefined ) this.setHeight();
    if ( this.height !== undefined ) this.setWidth();
    this.setBorderWidth();
    this.setBorderRadius();
    this.setSourceDir();
  }

  ngOnInit() {
  }


  private setSourceDir() {
    if ( this.empty ) {
      this.sourceDir = `assets/img/blank.png`;
      return;
    }
    if ( !this.faceUp ) {
      this.sourceDir = `${this.CARD_IMAGE_DIR}/Card_back.jpg`;
      return;
    }
    // Card_back_landscape
    // Boon-back
    // Hex-back
    // Stash-back
    // Randomizer
    this.sourceDir = `${this.CARD_IMAGE_DIR}/${this.card.name_eng.replace( / /g , '_' )}.jpg`;
  }

  setHeight() {
    this.widthDerived = this.width;
    if ( this.faceUp && this.card.isWideType() ) {
      this.heightDerived = this.widthDerived * (15 / 23);
    } else {
      this.heightDerived = this.widthDerived * (23 / 15);
    }
  }

  setWidth() {
    this.heightDerived = this.height;
    if ( this.faceUp && this.card.isWideType() ) {
      this.widthDerived = this.heightDerived * (23 / 15);
    } else {
      this.widthDerived = this.heightDerived * (15 / 23);
    }
  }

  setBorderWidth() {
    this.borderWidth = (18 / 250) * Math.min( this.widthDerived, this.heightDerived );
  }

  setBorderRadius() {
    this.borderRadius = (18 / 250) * Math.min( this.widthDerived, this.heightDerived );
  }

  onClicked() {
    if ( this.isButton ) {
      this.cardClicked.emit();
    }
  }

}
