import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-rule-books',
  template: `
    <div class="wrapper">
      <div *ngFor="let rulebook of RuleBooks" class='rulebook-box'>
        <a [href]='rulebook.pdfsrc' target="_blank">
          <mat-card>
            <img mat-card-image [src]='rulebook.imgsrc'>
            <mat-card-content>{{rulebook.title}}</mat-card-content>
          </mat-card>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: flex-end;
      align-content: flex-start;
    }
    .rulebook-box {
      margin: 30px;
      width: 250px;
    }
    .rulebook-box:hover {
      cursor: pointer;
    }
  `]
})
export class RuleBooksComponent implements OnInit {

  private COVER_IMAGE_DIR = 'assets/img/cover';
  private PDF_DIR = 'assets/pdf';


  RuleBooks: { imgsrc: string, pdfsrc: string, title: string }[] = [
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/01_Dominion_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_01_Original.pdf`,
      title: '01 - ドミニオン「基本」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/02_Intrigue_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_02_Intrigue.pdf`,
      title: '02 - ドミニオン「陰謀」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/03_Seaside_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_03_Seaside.pdf`,
      title: '03 - ドミニオン「海辺」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/04_Alchemy_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_04_Alchemy.pdf`,
      title: '04 - ドミニオン「錬金術」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/05_Prosperity_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_05_Prosperity.pdf`,
      title: '05 - ドミニオン「繁栄」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/06_Cornucopia_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_06_Cornucopia.pdf`,
      title: '06 - ドミニオン「収穫祭」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/07_Hinterlands_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_07_Hinterlands.pdf`,
      title: '07 - ドミニオン「異郷」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/08_Dark_Ages_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_08_Dark_Ages.pdf`,
      title: '08 - ドミニオン「暗黒時代」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/09_Guilds_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_09_Guilds.pdf`,
      title: '09 - ドミニオン「ギルド」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/10_Adventures_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_10_Adventures.pdf`,
      title: '10 - ドミニオン「冒険」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/11_Empires_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_11_Empires.pdf`,
      title: '11 - ドミニオン「帝国」',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/12_Dominion2nd_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_12_Dominion2nd.pdf`,
      title: '12 - ドミニオン 第2版',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/13_Intrigue2nd_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_13_Intrigue2nd.pdf`,
      title: '13 - ドミニオン「陰謀」 第2版',
    },
    {
      imgsrc: `${this.COVER_IMAGE_DIR}/14_Nocturne_Cover.png`,
      pdfsrc: `${this.PDF_DIR}/Dominion_gameRules_14_Nocturne.pdf`,
      title: '14 - ドミニオン「夜想曲」',
    },
  ];

  constructor(
  ) {}

  ngOnInit() {
  }

}
