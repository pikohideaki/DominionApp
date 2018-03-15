import { DataForCardEffect } from './data-for-card-effect';


export const forAllOtherPlayers = ( playerId: number,
  operation: ((data: DataForCardEffect, playerId: number) => void),
  data: DataForCardEffect,
) => {
  for ( let i = 0; i < data.gameState.numberOfPlayers; ++i ) {
    if ( i === playerId ) continue;
    operation( data, i );
  }
};

export const incrementVcoin = ( playerId: number,
  data: DataForCardEffect
) => {
  data.gameState.allPlayersData[ playerId ].vcoin++;
};

