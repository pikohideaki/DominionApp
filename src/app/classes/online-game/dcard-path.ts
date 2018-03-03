import { PlayerCardDirectory } from './player-card-directory';
import { BasicCardsDirectory } from './basic-cards-directory';


export type DCardPath = number
                            |PlayerCardDirectory
                            |BasicCardsDirectory
                            |'allPlayersCards'
                            |'BasicCards'
                            |'KingdomCards'
                            |'trashPile'
                            |'BlackMarketPile'
                          ;
