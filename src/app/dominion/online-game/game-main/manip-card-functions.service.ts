import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { CloudFirestoreMediatorService } from '../../../firebase-mediator/cloud-firestore-mediator.service';
import { UtilitiesService } from '../../../my-own-library/utilities.service';

import { CardProperty } from '../../../classes/card-property';
import { MyGameStateService } from './my-game-state.service';
import { TurnInfo,
         CommonCardData,
         CardDataForPlayer,
         PlayersCards,
         BasicCards,
         KingdomCards,
         PlayerData } from '../../../classes/game-room';


@Injectable()
export class ManipCardFunctionsService {
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
    players:          new Subject(),
  };


  private cardPropertyList: CardProperty[] = [];

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
  private playersData:      PlayerData[] = [];


  constructor(
    private myGameStateService: MyGameStateService,
    private database: CloudFirestoreMediatorService,
    private utils: UtilitiesService,
  ) {
    this.database.cardPropertyList$.subscribe( val => {
      this.cardPropertyList = val;
      this.dataIsReady.cardPropertyList.complete();
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
      this.dataIsReady.players.complete();
    });

  }


  async cardProperty( cardID: number ) {
    await this.dataIsReady.cardPropertyList.asObservable().toPromise();
    await this.dataIsReady.commonCardData.cardListIndex.asObservable().toPromise();
    return this.cardPropertyList[ this.commonCardData.cardListIndex[cardID] ];
  }


  // async forAllPlayers( f ) {
  //   await this.dataIsReady.players.asObservable().toPromise();
  //   this.playersData.map( (_, i) => i ).forEach( playerIndex => f(playerIndex) );
  // }

  async asyncForAllPlayers( f ) {
    await this.dataIsReady.players.asObservable().toPromise();
    await Promise.all( this.playersData.map( (_, i) => i ).map( playerIndex => f(playerIndex) ) );
  }


  getTopCardId( cardsPile: number[] ) {
    if ( cardsPile === undefined || cardsPile.length === 0 ) return 0;
    return cardsPile[0];
  }




  faceUpCards( idArray: number[], toPlayer: number, values?: boolean[] ) {
    if ( !idArray || idArray.length === 0 ) return;
    if ( !values || idArray.length !== values.length ) {
      values = idArray.map( _ => true );
    }
    const obj = {};
    idArray.forEach( (cardID, idx) => obj[cardID] = values[idx] );
    // console.log('faceUpCards', idArray, values, obj)
    return this.myGameStateService.updateCardDataForPlayer( toPlayer, 'faceUp', obj );
  }

  faceDownCards( idArray: number[], toPlayer: number ) {
    return this.faceUpCards( idArray, toPlayer, idArray.map( _ => false ) );
  }

  makeCardsClickable( idArray: number[], toPlayer: number, values?: boolean[] ) {
    if ( !idArray || idArray.length === 0 ) return;
    if ( !values || idArray.length !== values.length ) {
      values = idArray.map( _ => true );
    }
    const obj = {};
    idArray.forEach( (cardID, idx) => obj[cardID] = values[idx] );
    // console.log('makeCardsClickable', idArray, values, obj)
    return this.myGameStateService.updateCardDataForPlayer( toPlayer, 'isButton', obj );
  }

  makeCardsNonClickable( idArray: number[], toPlayer: number ) {
    return this.makeCardsClickable( idArray, toPlayer, idArray.map( _ => false ) );
  }

  faceUpCardsToAllPlayers( idArray: number[] ) {
    return this.asyncForAllPlayers( playerIndex => this.faceUpCards( idArray, playerIndex ) );
  }

  faceDownCardsToAllPlayers( idArray: number[] ) {
    return this.asyncForAllPlayers( playerIndex => this.faceDownCards( idArray, playerIndex ) );
  }

  makeCardsClickableToAllPlayers( idArray: number[] ) {
    return this.asyncForAllPlayers( playerIndex => this.makeCardsClickable( idArray, playerIndex ) );
  }

  makeCardsNonClickableToAllPlayers( idArray: number[] ) {
    return this.asyncForAllPlayers( playerIndex => this.makeCardsNonClickable( idArray, playerIndex ) );
  }



  setCardsPileState(
      idArray: number[],
      playerIndex: number,
      faceUp: boolean,
      isButton: boolean
  ) {
    const faceUpValues   = idArray.map( _ => false );
    const isButtonValues = idArray.map( _ => false );

    // face up the top card and face down others
    const topCardId = this.getTopCardId( idArray );
    if ( topCardId !== 0 ) {
      if ( faceUp   ) faceUpValues[0] = true;
      if ( isButton ) isButtonValues[0] = true;
    }

    // console.log( 'setCardsPileState', idArray, playerIndex, faceUpValues, isButtonValues );

    return Promise.all([
      this.faceUpCards( idArray, playerIndex, faceUpValues ),
      this.makeCardsClickable( idArray, playerIndex, isButtonValues ),
    ]);
  }

  setCardsPileStateForAllPlayers(
      idArray: number[],
      faceUp: boolean,
      isButton: boolean
  ) {
    return this.asyncForAllPlayers( playerIndex =>
        this.setCardsPileState( idArray, playerIndex, faceUp, isButton ) );
  }



  async isActionCard( cardID ) {
    // return (await this.cardProperty(cardID)).cardTypes.Action;
    return true;
  }
  async isNotActionCard( cardID ) {
    return !(await this.isActionCard(cardID));
  }

  async isTreasureCard( cardID ) {
    // return (await this.cardProperty(cardID)).cardTypes.Treasure;
    return true;
  }
  async isNotTreasureCard( cardID ) {
    return !(await this.isTreasureCard(cardID));
  }

  async isVictoryCard( cardID ) {
    // return (await this.cardProperty(cardID)).cardTypes.Victory;
    return true;
  }
  async isNotVictoryCard( cardID ) {
    return !(await this.isVictoryCard(cardID));
  }

  async filterActionCards( idArray: number[] ) {
    return this.utils.asyncFilter( idArray, id => this.isActionCard(id) );
  }

  async filterTreasureCards( idArray: number[] ) {
    return this.utils.asyncFilter( idArray, id => this.isTreasureCard(id) );
  }



  async getSupplyCards() {
    await this.dataIsReady.BasicCards.asObservable().toPromise();
    await this.dataIsReady.KingdomCards.asObservable().toPromise();
    return [].concat(
        this.utils.objectMap( this.BasicCards, e => this.getTopCardId(e) ),
        this.KingdomCards.map( e => this.getTopCardId(e) ) );
  }



  private async removeCardById( cardID: number ) {
    await this.dataIsReady.BasicCards.asObservable().toPromise();
    await this.dataIsReady.KingdomCards.asObservable().toPromise();
    await this.dataIsReady.playersCards.asObservable().toPromise();
    await this.dataIsReady.TrashPile.asObservable().toPromise();

    let path: (number|string)[] = [];

    this.utils.objectForEach( this.BasicCards, (idArray: number[], key: string) => {
      if ( idArray.includes(cardID) ) path = ['BasicCards', key ];
      this.utils.remove( idArray, cardID );
    } );

    this.KingdomCards.forEach( (idArray, index) => {
      if ( idArray.includes(cardID) ) path = ['KingdomCards', index];
      this.utils.remove( idArray, cardID );
    });

    this.playersCards.forEach( (player, playerIndex) =>
      this.utils.objectForEach( player, (idArray: number[], key: string) => {
        if ( idArray.includes(cardID) ) path = ['playersCards', playerIndex, key];
        this.utils.remove( idArray, cardID );
      }) );

    if ( this.TrashPile.includes(cardID) ) path = ['TrashPile'];
    this.utils.remove( this.TrashPile, cardID );

    console.log('removeCardById', path);
    if ( path.length === 0 ) throw new Error(`card with id '${cardID}' not found`);
    return path;
  }



  async moveCardToPlayArea( cardID: number, playerIndex: number ) {
    const removePath = await this.removeCardById( cardID );
    this.playersCards[ playerIndex ].PlayArea.push( cardID );

    await Promise.all([
      this.myGameStateService.removeCard( removePath.join('/'), cardID ),
      this.myGameStateService.addCard( `playersCards/${playerIndex}/PlayArea`, cardID ),
    ]);
  }



  async moveCardToDiscardPile( cardID: number, playerIndex: number ) {
    const removePath = await this.removeCardById( cardID );
    this.playersCards[ playerIndex ].DiscardPile.push( cardID );

    await Promise.all([
      this.myGameStateService.removeCard( removePath.join('/'), cardID ),
      this.myGameStateService.addCard( `playersCards/${playerIndex}/DiscardPile`, cardID ),
    ]);
  }




  async sortHandCards( playerIndex: number ) {
    await this.dataIsReady.playersCards.asObservable().toPromise();
    await this.dataIsReady.commonCardData.cardListIndex.asObservable().toPromise();

    const sorted
      = this.playersCards[playerIndex].HandCards
          .sort( (a, b) => this.commonCardData.cardListIndex[a] - this.commonCardData.cardListIndex[b] );

    let rest = sorted;
    let action, treasure, victory;
    action   = await this.utils.asyncFilter( rest,   id => this.isActionCard     (id) );
    rest     = await this.utils.asyncFilter( sorted, id => this.isNotActionCard  (id) );
    treasure = await this.utils.asyncFilter( rest,   id => this.isTreasureCard   (id) );
    rest     = await this.utils.asyncFilter( sorted, id => this.isNotTreasureCard(id) );
    victory  = await this.utils.asyncFilter( rest,   id => this.isVictoryCard    (id) );
    rest     = await this.utils.asyncFilter( sorted, id => this.isNotVictoryCard (id) );

    this.playersCards[playerIndex].HandCards
      = [].concat( action, treasure, victory, sorted );
  }

}
