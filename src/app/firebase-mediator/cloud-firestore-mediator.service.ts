import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { AngularFirestore    } from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { UtilitiesService   } from '../my-own-library/utilities.service';

import { User                  } from '../classes/user';
import { CardProperty          } from '../classes/card-property';
import { GameResult            } from '../classes/game-result';
import { RandomizerGroup       } from '../classes/randomizer-group';
import { GameRoom              } from '../classes/game-room';
import { SelectedCards         } from '../classes/selected-cards';
import { SelectedCardsCheckbox } from '../classes/selected-cards-checkbox-values';
import { GameState             } from '../classes/game-state';
import { BlackMarketPileCard   } from '../classes/black-market-pile-card';
import { ChatMessage           } from '../classes/chat-message';
import { PlayerResult          } from '../classes/player-result';


@Injectable()
export class CloudFirestoreMediatorService {
  fdPath = {
    expansionsNameList  : '/data/expansionsNameList',
    cardPropertyList    : '/data/cardPropertyList',
    users               : '/users',
    userInfoList        : '/userInfoList',
    scoringTable        : '/data/scoreTable',
    gameResultList      : '/data/gameResultList',
    randomizerGroupList : '/randomizerGroupList',
    onlineGameStateList : '/onlineGameStateList',
    onlineGameRoomsList : '/onlineGameRoomsList',
  };


  expansionsNameList$:  Observable<string[]>;
  cardPropertyList$:    Observable<CardProperty[]>;
  users$:               Observable<User[]>;
  scoringTable$:        Observable<number[][]>;
  gameResultList$:      Observable<GameResult[]>;
  randomizerGroupList$: Observable<RandomizerGroup[]>;
  onlineGameRoomList$:  Observable<GameRoom[]>;



  /* methods */
  user: {
    setUser: ( uid: string, newUser: User ) => Promise<void>,
    set: {
      name:              ( uid: string, value: string ) => Promise<void>,
      name_yomi:         ( uid: string, value: string ) => Promise<void>,
      randomizerGroupId: ( uid: string, value: string ) => Promise<void>,
      onlineGame: {
        isSelectedExpansions: ( uid: string, value: boolean[] ) => Promise<void>,
        numberOfPlayers:      ( uid: string, value: number    ) => Promise<void>,
        roomId:               ( uid: string, value: string    ) => Promise<void>,
        gameStateId:          ( uid: string, value: string    ) => Promise<void>,
        chatOpened:           ( uid: string, value: boolean   ) => Promise<void>,
      }
    }
  };

  gameResult: {
    add:     ( gameResult: GameResult )     => firebase.database.ThenableReference,
    remove:  ( key: string )                => Promise<void>,
    setMemo: ( key: string, value: string ) => Promise<void>,
  };

  randomizerGroup: {
    addGroup:    ( newGroup: RandomizerGroup ) => firebase.database.ThenableReference,
    removeGroup: ( groupId: string )           => Promise<void>,
    set: {
      randomizerButtonLocked:    ( groupId: string, value: boolean )                                   => Promise<void>,
      isSelectedExpansions:      ( groupId: string, index: number, value: boolean )                    => Promise<void>,
      selectedCards:             ( groupId: string, value: SelectedCards )                             => Promise<void>,
      selectedCardsCheckbox:     ( groupId: string, arrayName: string, index: number, value: boolean ) => Promise<void>,
      BlackMarketPileShuffled:   ( groupId: string, value: BlackMarketPileCard[] )                     => Promise<void>,
      BlackMarketPhase:          ( groupId: string, value: number )                                    => Promise<void>,
      lastTurnPlayerName:        ( groupId: string, value: string  )                                   => Promise<void>,
      newGameResultDialogOpened: ( groupId: string, value: boolean )                                   => Promise<void>,
      newGameResult: {
        players: {
          selected:  ( groupId: string, uid: string, value: boolean ) => Promise<void>,
          VP:        ( groupId: string, uid: string, value: number  ) => Promise<void>,
          turnOrder: ( groupId: string, uid: string, value: number  ) => Promise<void>,
        },
        place: ( groupId: string, value: string ) => Promise<void>,
        memo:  ( groupId: string, value: string ) => Promise<void>,
      },
    },
    add: {
      member: ( groupId: string, uid: string, value: PlayerResult ) => Promise<void>,
      selectedCardsHistory:  ( groupId: string, value ) => firebase.database.ThenableReference,
    },
    remove: {
      member: ( groupId: string, uid: string ) => Promise<void>,
    },
    reset: {
      selectedCards:         ( groupId: string )                       => Promise<void>,
      selectedCardsCheckbox: ( groupId: string )                       => Promise<void>,
      VPCalculator:          ( groupId: string )                       => Promise<void>,
    },
  };

  onlineGameRoom: {
    add:                       ( newGameRoom: GameRoom )              => firebase.database.ThenableReference,
    remove:                    ( roomId: string )                     => Promise<void>,
    addMember:                 ( roomId: string, playerName: string ) => firebase.database.ThenableReference,
    removeMember:              ( roomId: string, uid: string )        => Promise<void>,
    setWaitingForPlayersValue: ( roomId: string, value: boolean )     => Promise<void>,
  };

  onlineGameState: {
    add:        ( gameState: GameState )                         => firebase.database.ThenableReference,
    remove:     ( gameStateId: string )                          => Promise<void>,
    addMessage: ( gameStateId: string, newMessage: ChatMessage ) => firebase.database.ThenableReference,
    update:     ( gameStateId: string, object: Object )          => Promise<void>,
    set: {
      turnCounter: ( gameStateId: string, value: number ) => Promise<void>,
      turnInfo:    ( gameStateId: string, value )         => Promise<void>,
      phase:       ( gameStateId: string, value )         => Promise<void>,
    },
  };




  constructor(
    private afs: AngularFirestore,
    private afdb: AngularFireDatabase,
    private utils: UtilitiesService,
  ) {
    this.expansionsNameList$
      = afdb.list<string>( this.fdPath.expansionsNameList ).valueChanges()
              .map( list => list.map( e => e.toString() ) )
              .first();

    this.cardPropertyList$
      = afdb.list<CardProperty>( this.fdPath.cardPropertyList ).valueChanges()
              .map( list => list.map( (e: any) => new CardProperty(e) ) )
              .first();

    this.users$
      = this.afdb.list( this.fdPath.users, ref => ref.orderByChild('name_yomi') ).snapshotChanges()
          .map( actions => actions.map( action => new User( action.key, action.payload.val() ) ) );

    this.scoringTable$
      = afdb.list<number[]>( this.fdPath.scoringTable ).valueChanges();

    this.gameResultList$
      = Observable.combineLatest(
          this.scoringTable$,
          this.afdb.list<GameResult>( this.fdPath.gameResultList ).snapshotChanges(),
          (scoringTable: number[][], actions) => {
              const gameResultList = actions.map( action => new GameResult( action.key, action.payload.val() ) );
              gameResultList.forEach( (gr, index) => {
                gr.setScores( scoringTable );
                gr.no = index + 1;
              } );
              return gameResultList;
            } );


    this.randomizerGroupList$
      = this.afdb.list( this.fdPath.randomizerGroupList ).snapshotChanges()
          .map( actions => actions.map( action => new RandomizerGroup( action.key, action.payload.val() ) ) );

    this.onlineGameRoomList$
      = this.afdb.list( this.fdPath.onlineGameRoomsList ).snapshotChanges()
          .map( actions => actions.map( action => new GameRoom( action.key, action.payload.val() ) ) );


    /*** methods ***/

    const userSetProperty = ( uid: string, pathPrefix: string, value: any ) => {
      if ( !uid ) throw new Error('uid is empty');
      return this.afdb.object( `${this.fdPath.users}/${uid}/${pathPrefix}` )
                      .set( value );
    };
    this.user = {
      setUser: ( uid: string, newUser: User ) => {
        const newUserObj = this.utils.copyObject( newUser );
        delete newUserObj.databaseKey;
        return this.afdb.object(`${this.fdPath.users}/${uid}`).set( newUserObj );
      },

      set: {
        name: ( uid: string, value: string ) =>
          userSetProperty( uid, 'name', value ),

        name_yomi: ( uid: string, value: string ) =>
          userSetProperty( uid, 'name_yomi', value ),

        randomizerGroupId: ( uid: string, value: string ) =>
          userSetProperty( uid, 'randomizerGroupID', value ),

        onlineGame: {
          isSelectedExpansions: ( uid: string, value: boolean[] ) =>
            userSetProperty( uid, 'onlineGame/isSelectedExpansions', value ),

          numberOfPlayers: ( uid: string, value: number ) =>
            userSetProperty( uid, 'onlineGame/numberOfPlayers', value ),

          roomId: ( uid: string, value: string ) =>
            userSetProperty( uid, 'onlineGame/roomID', value ),

          gameStateId: ( uid: string, value: string ) =>
            userSetProperty( uid, 'onlineGame/gameStateID', value ),

          chatOpened: ( uid: string, value: boolean ) =>
            userSetProperty( uid, 'onlineGame/chatOpened', value ),
        }
      }
    };



    this.gameResult = {
      add: ( gameResult: GameResult ) => {
        const copy = this.utils.copyObject( gameResult );
        delete copy.no;
        delete copy.date;
        copy.timeStamp = gameResult.date.valueOf();
        copy.players.forEach( pl => {
          delete pl.rank;
          delete pl.score;
        });
        return this.afdb.list( this.fdPath.gameResultList ).push( copy );
      },

      remove: ( key: string ) =>
        this.afdb.list( `${this.fdPath.gameResultList}/${key}` ).remove(),

      setMemo: ( key: string, value: string ) =>
        this.afdb.object( `${this.fdPath.gameResultList}/${key}/memo` ).set( value ),
    };



    const randomizerGroupSetValue = ( groupId: string, pathPrefix: string, value: any ) => {
      if ( !groupId ) throw new Error('groupId is empty');
      return this.afdb.object( `${this.fdPath.randomizerGroupList}/${groupId}/${pathPrefix}` )
                      .set( value );
    };
    const randomizerGroupPushValue = ( groupId: string, pathPrefix: string, value: any ) => {
      if ( !groupId ) throw new Error('groupId is empty');
      return this.afdb.list( `${this.fdPath.randomizerGroupList}/${groupId}/${pathPrefix}` )
                      .push( value );
    };

    this.randomizerGroup = {
      addGroup: ( newGroup: RandomizerGroup ) => {
        const newGroupObj = this.utils.copyObject( newGroup );  // deep copy
        newGroupObj.timeStamp = newGroup.date.valueOf();
        delete newGroupObj.date;
        delete newGroupObj.databaseKey;
        newGroupObj.newGameResult.players = {};
        newGroup.newGameResult.players.forEach( e => {
          const playerResultObj = this.utils.copyObject(e);
          delete playerResultObj.uid;
          newGroupObj.newGameResult.players[e.uid] = playerResultObj;
        } );
        return this.afdb.list( this.fdPath.randomizerGroupList ).push( newGroupObj );
      },

      removeGroup: ( groupId: string ) =>
        this.afdb.list( this.fdPath.randomizerGroupList ).remove( groupId ),

      set: {
        randomizerButtonLocked: ( groupId: string, locked: boolean ) =>
          randomizerGroupSetValue( groupId, 'randomizerButtonLocked', locked ),

        isSelectedExpansions: ( groupId: string, index: number, value: boolean ) =>
          randomizerGroupSetValue( groupId, `isSelectedExpansions/${index}`, value ),

        selectedCards: ( groupId: string, value: SelectedCards ) =>
          randomizerGroupSetValue( groupId, 'selectedCards', value ),

        selectedCardsCheckbox: ( groupId: string, arrayName: string, index: number, value: boolean ) => {
          switch (arrayName) {
            case 'KingdomCards10' :
            case 'BaneCard' :
            case 'EventCards' :
            case 'LandmarkCards' :
            case 'Obelisk' :
            case 'BlackMarketPile' :
              return randomizerGroupSetValue( groupId, `selectedCardsCheckbox/${arrayName}/${index}`, value );

            default :
              console.error( `at fire-database-mediator.service::randomizerGroup::selectedCardsCheckbox : '${arrayName}' is not allowed `);
              return Promise.resolve();
          }
        },

        BlackMarketPileShuffled: ( groupId: string, value: BlackMarketPileCard[] ) =>
          randomizerGroupSetValue( groupId, 'BlackMarketPileShuffled', value ),

        BlackMarketPhase: ( groupId: string, value: number ) =>
          randomizerGroupSetValue( groupId, 'BlackMarketPhase', value ),

        lastTurnPlayerName: ( groupId: string, value: string ) =>
          randomizerGroupSetValue( groupId, `lastTurnPlayerName`, value ),

        newGameResultDialogOpened: ( groupId: string, value: boolean ) =>
          randomizerGroupSetValue( groupId, `newGameResultDialogOpened`, value ),

        newGameResult: {
          players: {
            selected: ( groupId: string, uid: string, value: boolean ) =>
              randomizerGroupSetValue( groupId, `newGameResult/players/${uid}/selected`, value ),

            VP: ( groupId: string, uid: string, value: number ) =>
              randomizerGroupSetValue( groupId, `newGameResult/players/${uid}/VP`, value ),

            turnOrder: ( groupId: string, uid: string, value: number ) =>
              randomizerGroupSetValue( groupId, `newGameResult/players/${uid}/turnOrder`, value ),
          },
          place: ( groupId: string, value: string ) =>
            randomizerGroupSetValue( groupId, `newGameResult/place`, value ),
          memo:  ( groupId: string, value: string ) =>
            randomizerGroupSetValue( groupId, `newGameResult/memo`, value ),
        },
      },

      add: {
        member: ( groupId: string, uid: string, value: PlayerResult ) => {
          const obj = this.utils.copyObject( value );
          delete obj.uid;
          return randomizerGroupSetValue( groupId, `newGameResult/players/${uid}`, obj );
        },

        selectedCardsHistory:  ( groupId: string, value ) =>
          randomizerGroupPushValue( groupId, 'selectedCardsHistory', value ),
      },
      remove: {
        member: ( groupId: string, uid: string ) =>
          this.afdb.list( `${this.fdPath.randomizerGroupList}/${groupId}/newGameResult/players` ).remove( uid ),
      },
      reset: {
        selectedCards:         ( groupId: string ) =>
          randomizerGroupSetValue( groupId, 'selectedCards', new SelectedCards() ),

        selectedCardsCheckbox: ( groupId: string ) =>
          randomizerGroupSetValue( groupId, 'selectedCardsCheckbox', new SelectedCardsCheckbox() ),

        VPCalculator:          ( groupId: string ) =>
          randomizerGroupSetValue( groupId, 'resetVPCalculator', Date.now() ),
      },

    };


    this.onlineGameRoom = {
      add: ( newGameRoom: GameRoom ) => {
        const newGameRoomObj = this.utils.copyObject( newGameRoom );  // deep copy
        newGameRoomObj.timeStamp = newGameRoomObj.date.valueOf();
        delete newGameRoomObj.date;
        delete newGameRoomObj.databaseKey;
        return this.afdb.list( this.fdPath.onlineGameRoomsList ).push( newGameRoomObj );
      },

      remove: ( roomId: string ) =>
        this.afdb.list( this.fdPath.onlineGameRoomsList ).remove( roomId ),

      addMember: ( roomId: string, playerName: string ) =>
        this.afdb.list( `${this.fdPath.onlineGameRoomsList}/${roomId}/players` ).push( playerName ),

      removeMember: ( roomId: string, uid: string ) =>
        this.afdb.list( `${this.fdPath.onlineGameRoomsList}/${roomId}/players` ).remove( uid ),

      setWaitingForPlayersValue: ( roomId: string, value: boolean ) =>
        this.afdb.object( `${this.fdPath.onlineGameRoomsList}/${roomId}/waitingForPlayers` ).set( value ),
    };


    this.onlineGameState = {
      add: ( newGameState: GameState ) => {
        const newGameStateObj = this.utils.copyObject( newGameState );

        /* convert array to { val: true } object */
        // newGameStateObj.cards = {};

        // newGameStateObj.cards.BasicCards = {};
        // this.utils.objectForEach( newGameState.cards.BasicCards, (val: number[], key) => {
        //   newGameStateObj.cards.BasicCards[key] = {};
        //   val.forEach( (id, i) => newGameStateObj.cards.BasicCards[key][id] = i );
        // } );

        // newGameStateObj.cards.KingdomCards = {};
        // newGameState.cards.KingdomCards.forEach( (val: number[], key) => {
        //   newGameStateObj.cards.KingdomCards[key] = {};
        //   val.forEach( (id, i) => newGameStateObj.cards.KingdomCards[key][id] = i );
        // } );

        // newGameStateObj.cards.playersCards = [];
        // newGameState.cards.playersCards.forEach( (player, playerIndex) => {
        //   newGameStateObj.cards.playersCards[playerIndex] = {};
        //   this.utils.objectForEach( player, (val: number[], key) => {
        //     newGameStateObj.cards.playersCards[playerIndex][key] = {};
        //     val.forEach( (id, i) => newGameStateObj.cards.playersCards[playerIndex][key][id] = i );
        //   } );
        // });

        // newGameStateObj.cards.TrashPile = {};
        // newGameState.cards.TrashPile.forEach( (id, i) => newGameStateObj.cards.TrashPile[id] = i );

        return this.afdb.list( this.fdPath.onlineGameStateList ).push( newGameStateObj );
      },

      remove: ( id: string ) =>
        this.afdb.list( this.fdPath.onlineGameStateList ).remove( id ),

      addMessage: ( gameStateId: string, newMessage: ChatMessage ) =>
        this.afdb.list( `${this.fdPath.onlineGameStateList}/${gameStateId}/chatList` ).push( newMessage ),

      update: ( gameStateId: string, object: Object ) =>
        this.afdb.object(`${this.fdPath.onlineGameStateList}/${gameStateId}`).update( object ),

      set: {
        turnCounter: ( gameStateId: string, value: number ) =>
          this.afdb.object(`${this.fdPath.onlineGameStateList}/${gameStateId}/turnCounter`)
            .set( value ),

        turnInfo: ( gameStateId: string, value ) =>
          this.afdb.object(`${this.fdPath.onlineGameStateList}/${gameStateId}/turnInfo`)
            .set( value ),

        phase: ( gameStateId: string, value ) =>
          this.afdb.object(`${this.fdPath.onlineGameStateList}/${gameStateId}/turnInfo/phase`)
            .set( value ),

      }
    };
  }

}
