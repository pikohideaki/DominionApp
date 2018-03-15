import { DataForCardEffect } from './data-for-card-effect';
import * as CardEffectShortcut from './card-effect-shortcut';
import { DCard } from '../../../../../../classes/online-game/dcard';


/* パン屋 */
export const Baker = async ( dcard: DCard, playerId: number,
  data: DataForCardEffect
) => {
  CardEffectShortcut.incrementVcoin( playerId, data );
};

/* 蝋燭職人 */
export const Candlestick_Maker = async ( dcard: DCard, playerId: number,
  data: DataForCardEffect
) => {
  CardEffectShortcut.incrementVcoin( playerId, data );
};



