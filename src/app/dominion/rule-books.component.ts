import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-rule-books',
  template: `
    <div *ngFor="let rulebook of RuleBooks" class='rulebook-box'>
      <a [href]='rulebook.pdfsrc' target="_blank">
        <mat-card class='rulebook-cover' >
          <img mat-card-image [src]='rulebook.imgsrc'>
          <mat-card-content>{{rulebook.title}}</mat-card-content>
        </mat-card>
      </a>
    </div>
  `,
  styles: [`
    .rulebook-box {
      height: 420px;
      margin: 30px;
      float: left;
    }
    .rulebook-cover {
      width: 240px;
    },
    .rulebook:hover {
      cursor: pointer;
    }
  `]
})
export class RuleBooksComponent implements OnInit {

  private COVER_IMAGE_DIR = 'assets/img/cover';
  private PDF_DIR = 'assets/pdf';


  RuleBooks: { imgsrc: string, pdfsrc: string, title: string }[] = [
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/01_Dominion_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_01_Original.pdf`,
      title: '01 - ドミニオン「基本」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/02_Intrigue_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_02_Intrigue.pdf`,
      title: '02 - ドミニオン「陰謀」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/03_Seaside_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_03_Seaside.pdf`,
      title: '03 - ドミニオン「海辺」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/04_Alchemy_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_04_Alchemy.pdf`,
      title: '04 - ドミニオン「錬金術」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/05_Prosperity_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_05_Prosperity.pdf`,
      title: '05 - ドミニオン「繁栄」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/06_Cornucopia_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_06_Cornucopia.pdf`,
      title: '06 - ドミニオン「収穫祭」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/07_Hinterlands_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_07_Hinterlands.pdf`,
      title: '07 - ドミニオン「異郷」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/08_Dark_Ages_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_08_Dark_Ages.pdf`,
      title: '08 - ドミニオン「暗黒時代」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/09_Guilds_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_09_Guilds.pdf`,
      title: '09 - ドミニオン「ギルド」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/10_Adventures_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_10_Adventures.pdf`,
      title: '10 - ドミニオン「冒険」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/11_Empires_Cover@2x.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_11_Empires.pdf`,
      title: '11 - ドミニオン「帝国」',
    },
  ];

  constructor(
  ) {}

  ngOnInit() {
  }

}
