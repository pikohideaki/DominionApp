import { DataForCardEffect } from './data-for-card-effect';
import * as CardEffectShortcut from './card-effect-shortcut';
import { DCard } from '../../../../../../classes/online-game/dcard';
import { drawCards } from '../shortcut';


/* 13. 議事堂 */
export const Council_Room = async ( dcard: DCard, playerId: number,
  data: DataForCardEffect
) => {
  CardEffectShortcut.forAllOtherPlayers(
      playerId,
      (d: DataForCardEffect, pid: number) => drawCards( 1, pid, data, true ),
      data );
};

