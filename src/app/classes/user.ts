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
  } = {
    isSelectedExpansions: [],
    numberOfPlayers:      2,
    roomId:               '',
    communicationId:      '',
    chatOpened:           true,
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
  }
}
