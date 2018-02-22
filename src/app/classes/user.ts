export class User {
  databaseKey:       string;

  name:              string = '';
  nameYomi:          string = '';
  randomizerGroupId: string = '';

  onlineGame: {
    isSelectedExpansions: boolean[],
    numberOfPlayers:      number,
    roomId:               string,
    communicationId:      string,
    chatOpened:           boolean,
    cardSizeAutoChange:   boolean,
    cardSizeRatio:        number,
    messageSpeed:         number,
    autoSort:             boolean,
    autoPlayAllTreasures: boolean,
  } = {
    isSelectedExpansions: [],
    numberOfPlayers:      2,
    roomId:               '',
    communicationId:      '',
    chatOpened:           true,
    cardSizeAutoChange:   true,
    cardSizeRatio:        1,
    messageSpeed:         1,
    autoSort:             true,
    autoPlayAllTreasures: false,
  };

  constructor( databaseKey?: string, initObj?: {
      name:              string,
      nameYomi:          string,
      randomizerGroupId: string,
      onlineGame: {
        isSelectedExpansions: boolean[],
        numberOfPlayers:      number,
        roomId:               string,
        communicationId:      string,
        chatOpened:           boolean,
        cardSizeAutoChange:   boolean,
        cardSizeRatio:        number,
        messageSpeed:         number,
        autoSort:             boolean,
        autoPlayAllTreasures: boolean,
      }
  }) {
    this.databaseKey = ( databaseKey || '' );

    if ( !initObj ) return;
    this.name                            = ( initObj.name || '' );
    this.nameYomi                        = ( initObj.nameYomi || '' );
    this.randomizerGroupId               = ( initObj.randomizerGroupId || '' );
    if ( !initObj.onlineGame ) return;
    this.onlineGame.isSelectedExpansions = ( initObj.onlineGame.isSelectedExpansions || [] );
    this.onlineGame.numberOfPlayers      = ( initObj.onlineGame.numberOfPlayers      || 2  );
    this.onlineGame.roomId               = ( initObj.onlineGame.roomId               || '' );
    this.onlineGame.communicationId      = ( initObj.onlineGame.communicationId      || '' );
    this.onlineGame.chatOpened           = !!initObj.onlineGame.chatOpened;
    this.onlineGame.cardSizeAutoChange   = !!initObj.onlineGame.cardSizeAutoChange;
    this.onlineGame.cardSizeRatio        = ( initObj.onlineGame.cardSizeRatio        || 1  );
    this.onlineGame.messageSpeed         = ( initObj.onlineGame.messageSpeed         || 1  );
    this.onlineGame.autoSort             = !!initObj.onlineGame.autoSort;
    this.onlineGame.autoPlayAllTreasures = !!initObj.onlineGame.autoPlayAllTreasures;
  }
}
