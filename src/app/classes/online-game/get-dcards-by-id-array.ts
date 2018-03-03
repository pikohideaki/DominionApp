import { DCard } from "./dcard";

export function getDCardsByIdArray(
  idArray: (number[]|void),
  dcards: DCard[]
): DCard[] {
  // cardIdArrayの順番で取得
  if ( !idArray ) return dcards;
  return idArray.map( id => dcards.find( c => c.id === id ) ).filter( e => e !== undefined );
}
