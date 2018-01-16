import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MatDialog } from '@angular/material';

import { UtilitiesService } from '../../../my-own-library/utilities.service';
import { MyUserInfoService } from '../../../firebase-mediator/my-user-info.service';
import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';

import { MyGameRoomService  } from './my-game-room.service';
import { MyGameStateService } from './my-game-state.service';
import { ManipCardFunctionsService } from './manip-card-functions.service';

import { MessageDialogComponent } from '../../../my-own-library/message-dialog.component';

import { CardProperty } from '../../../classes/card-property';
import {
    TurnInfo,
    CommonCardData,
    CardDataForPlayer,
    PlayersCards,
    BasicCards,
    KingdomCards,
    PlayerData } from '../../../classes/game-room';



@Injectable()
export class GameLoopService {

  GO_TO_NEXT_PHASE_ID  = 99999;
  GO_TO_NEXT_PLAYER_ID = 999999;
  clickedCardIdSource = new Subject<number>();
  private clickedCardId$ = this.clickedCardIdSource.asObservable().filter( v => v >= 0 );
  private waitForClickingCardResolver: (clickedCardId: number) => void;


  private dataIsReady = {
    commonCardData: {
      cardListIndex: new Subject(),
    },
    cardDataForMe: {
      faceUp:   new Subject(),
      isButton: new Subject(),
    },
    cardPropertyList: new Subject(),
    turnPlayersCards: new Subject(),
    playersCards:     new Subject(),
    BasicCards:       new Subject(),
    KingdomCards:     new Subject(),
    TrashPile:        new Subject(),
    turnPlayerIndex:  new Subject(),
    turnCounter:      new Subject(),
    turnInfo:         new Subject(),
    playersData:          new Subject(),
  };



  goToNextPlayerState: boolean = false;

  private players: string[] = [];
  private cardPropertyList: CardProperty[] = [];
  private myIndex: number;

  private commonCardData:   CommonCardData = new CommonCardData();
  private cardDataForMe:    CardDataForPlayer = new CardDataForPlayer();
  private turnPlayersCards: PlayersCards = new PlayersCards();
  private playersCards:     PlayersCards[] = [];
  private BasicCards:       BasicCards = new BasicCards();
  private KingdomCards:     KingdomCards = new KingdomCards();
  private TrashPile:        number[] = [];
  private turnPlayerIndex:  number = 0;
  private turnCounter:      number = 0;
  private turnInfo:         TurnInfo = new TurnInfo();
  private playersData:          PlayerData[] = [];


  constructor(
    public dialog: MatDialog,
    private utils: UtilitiesService,
    private database: CloudFirestoreMediatorService,
    private myUserInfo: MyUserInfoService,
    private myGameRoomService: MyGameRoomService,
    private myGameStateService: MyGameStateService,
    private manipCardService: ManipCardFunctionsService,
  ) {
    this.clickedCardId$.subscribe( clickedCardId => {
      console.log( 'clickedCardId = ', clickedCardId );
      this.waitForClickingCardResolver( clickedCardId );
    });

    this.myGameStateService.commonCardData$$.cardListIndex$.subscribe( val => {
      this.commonCardData.cardListIndex = val;
      this.dataIsReady.commonCardData.cardListIndex.complete();
    });

    this.myGameStateService.cardDataForMe$$.faceUp$.subscribe( val => {
      this.cardDataForMe.faceUp = val;
      this.dataIsReady.cardDataForMe.faceUp.complete();
    });

    this.myGameStateService.cardDataForMe$$.isButton$.subscribe( val => {
      this.cardDataForMe.isButton = val;
      this.dataIsReady.cardDataForMe.isButton.complete();
    });

    this.myGameStateService.turnPlayersCards$.subscribe( val => {
      this.turnPlayersCards = val;
      this.dataIsReady.turnPlayersCards.complete();
    });

    this.myGameStateService.playersCards$.subscribe( val => {
      this.playersCards = val;
      this.dataIsReady.playersCards.complete();
    });

    this.myGameStateService.BasicCards$.subscribe( val => {
      this.BasicCards = val;
      this.dataIsReady.BasicCards.complete();
    });

    this.myGameStateService.KingdomCards$.subscribe( val => {
      this.KingdomCards = val;
      this.dataIsReady.KingdomCards.complete();
    });

    this.myGameStateService.TrashPile$.subscribe( val => {
      this.TrashPile = val;
      this.dataIsReady.TrashPile.complete();
    });

    this.myGameStateService.turnPlayerIndex$.subscribe( val => {
      this.turnPlayerIndex = val;
      this.dataIsReady.turnPlayerIndex.complete();
    });

    this.myGameStateService.turnCounter$.subscribe( val => {
      this.turnCounter = val;
      this.dataIsReady.turnCounter.complete();
    });

    this.myGameStateService.turnInfo$.subscribe( val => {
      this.turnInfo = val;
      this.dataIsReady.turnInfo.complete();
    });

    this.myGameStateService.playersData$.subscribe( val => {
      this.playersData = val;
      this.dataIsReady.playersData.complete();
    });


    const players$ = this.myGameRoomService.myGameRoom$.map( e => e.playersName );
    players$.subscribe( val => {
      this.players = val;
    });

    this.myGameRoomService.myIndex$.subscribe( val => this.myIndex = val );

    this.database.cardPropertyList$.subscribe( val => this.cardPropertyList = val );

  }


  async startMyTurn() {
    console.log('startMyTurn');

    this.showDialog();

    this.goToNextPlayerState = false;

    await Promise.all([
      this.resetTurnInfo(),
      this.resetCardsData(),
    ]);

    if ( !this.goToNextPlayerState ) {
      await this.actionPhase();
    }
    if ( !this.goToNextPlayerState ) {
      await this.buyPhase();
    }
    if ( !this.goToNextPlayerState ) {
      await this.buyPhase_getCards();
    }
    await this.cleanUpPhase();
    await this.goToNextPlayer();

    this.goToNextPlayerState = false;
  }


  private showDialog() {
    console.log('showDialog');

    const dialogRef = this.dialog.open( MessageDialogComponent );
    dialogRef.componentInstance.message
      = `${this.players[ this.turnPlayerIndex ]}のターン`;
    setTimeout( () => dialogRef.close(), 2000 );
  }



  private async resetTurnInfo() {
    console.log('resetTurnInfo');

    await this.dataIsReady.turnInfo.asObservable().toPromise();
    this.turnInfo.action = 1;
    this.turnInfo.buy    = 1;
    this.turnInfo.coin   = 0;
    await this.myGameStateService.setTurnInfo( this.turnInfo );
  }



  private async resetCardsData() {
    console.log('resetCardsData');

    await this.dataIsReady.BasicCards.asObservable().toPromise();
    await this.dataIsReady.KingdomCards.asObservable().toPromise();
    await this.dataIsReady.playersCards.asObservable().toPromise();
    await this.dataIsReady.TrashPile.asObservable().toPromise();

    await Promise.all( [].concat(
      this.utils.objectMap( this.BasicCards, idArray =>
        this.manipCardService.setCardsPileStateForAllPlayers( idArray, true, false ) ),

      this.KingdomCards.map( idArray =>
        this.manipCardService.setCardsPileStateForAllPlayers( idArray, true, false ) ),

      this.playersCards.map( (playerCards, playerIndex) => [
        this.manipCardService.setCardsPileStateForAllPlayers( playerCards.Deck, false, false ),
        this.manipCardService.setCardsPileStateForAllPlayers(
          [].concat( playerCards.DiscardPile ).reverse(), true, false ),

        this.manipCardService.faceDownCardsToAllPlayers( playerCards.HandCards ),
        this.manipCardService.makeCardsNonClickableToAllPlayers( playerCards.HandCards ),
      ] ),

      this.manipCardService.setCardsPileStateForAllPlayers( this.TrashPile, true, false ),
    ) );

    await Promise.all(
      this.playersCards.map( (playerCards, toPlayer) =>
        this.manipCardService.faceUpCards( playerCards.HandCards, toPlayer ) ) );
  }



  private async waitForClickingCard( idArray: number[], playerIndex: number ) {
    if ( !idArray || idArray.length === 0 ) {
      console.log('at waitForClickingCard; idArray is empty');
      return;
    }
    console.log('waitForClickingCard', idArray);
    await Promise.all([
      this.manipCardService.faceUpCards( idArray, playerIndex ),
      this.manipCardService.makeCardsClickable( idArray, playerIndex ),
    ]);
    return new Promise<number>( resolve => this.waitForClickingCardResolver = resolve );
  }



  private async actionPhase() {
    console.log('actionPhase');

    await this.myGameStateService.setPhase('action');
    while (true) {
      const actionCards
        = await this.manipCardService.filterActionCards( this.turnPlayersCards.HandCards );
      if ( actionCards.length === 0 ) break;

      const clickedCardID = await this.waitForClickingCard( actionCards, this.myIndex );

      if ( clickedCardID === this.GO_TO_NEXT_PHASE_ID ||
           clickedCardID === this.GO_TO_NEXT_PLAYER_ID ) break;

      await Promise.all([
        this.manipCardService.moveCardToPlayArea( clickedCardID, this.myIndex ),
        this.getCardEffect( clickedCardID ),
      ]);
    }

    const actionCards
      = await this.manipCardService.filterActionCards( this.turnPlayersCards.HandCards );
    await this.manipCardService.makeCardsNonClickable( actionCards, this.myIndex );
  }



  private async buyPhase() {
    console.log('buyPhase');

    await this.myGameStateService.setPhase('buy');
    while (true) {
      const treasureCards
        = await this.manipCardService.filterTreasureCards( this.turnPlayersCards.HandCards );
      if ( treasureCards.length === 0 ) break;

      const clickedCardID = await this.waitForClickingCard( treasureCards, this.myIndex );

      if ( clickedCardID === this.GO_TO_NEXT_PHASE_ID ||
           clickedCardID === this.GO_TO_NEXT_PLAYER_ID ) break;

      await Promise.all([
        this.manipCardService.moveCardToPlayArea( clickedCardID, this.myIndex ),
        this.getCardEffect( clickedCardID ),
      ]);
    }

    const treasureCards
      = await this.manipCardService.filterTreasureCards( this.turnPlayersCards.HandCards );
    await this.manipCardService.makeCardsNonClickable( treasureCards, this.myIndex );
  }




  private async buyPhase_getCards() {
    console.log('buyPhase_getCards');

    await this.myGameStateService.setPhase('buyCard');
    while ( this.turnInfo.buy > 0 ) {
      const supplyCards = await this.manipCardService.getSupplyCards();
      const clickedCardID = await this.waitForClickingCard( supplyCards, this.myIndex );

      if ( clickedCardID === this.GO_TO_NEXT_PHASE_ID ||
           clickedCardID === this.GO_TO_NEXT_PLAYER_ID ) break;

      await Promise.all([
        this.manipCardService.moveCardToDiscardPile( clickedCardID, this.myIndex ),
        /* use coin */
      ]);

      const supplyCards2 = await this.manipCardService.getSupplyCards();
      await this.manipCardService.faceUpCardsToAllPlayers( supplyCards2 );
    }
  }



  private async cleanUpPhase() {
    console.log('cleanUpPhase');

    await this.myGameStateService.setPhase('cleanUp');

  }

  private async goToNextPlayer() {
    console.log('goToNextPlayer');

    this.myGameStateService.setTurnCounter( this.turnCounter + 1 );
  }

  private async getCardEffect( cardID: number ) {
    const cardProp = await this.manipCardService.cardProperty( cardID );
    this.turnInfo.action += cardProp.action;
    this.turnInfo.buy    += cardProp.buy;
    this.turnInfo.coin   += cardProp.coin;
    await this.myGameStateService.setTurnInfo( this.turnInfo );
  }





  test() {
    this.myGameStateService.benchmark2( this.cardDataForMe );
  }
  faceUpCurse() {
    this.myGameStateService.benchmark(true);
  }
  faceDownCurse() {
    this.myGameStateService.benchmark(false);
  }

}
