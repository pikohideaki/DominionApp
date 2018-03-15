import { DCard } from '../../../../../classes/online-game/dcard';
import { GameState } from '../../../../../classes/online-game/game-state';
import { DataForCardEffect } from './card-effect-definitions/data-for-card-effect';

import * as Guild from './card-effect-definitions/09_Guild';



export const getAdditionalEffect = async ( dcard: DCard, playerId: number,
  data: DataForCardEffect
) => {
  switch ( dcard.cardProperty.cardId ) {
    case 'Baker':             await Guild.Baker( dcard, playerId, data ); break;
    case 'Candlestick_Maker': await Guild.Candlestick_Maker( dcard, playerId, data ); break;
  }

  data.gameStateSetter( data.gameState );
};
