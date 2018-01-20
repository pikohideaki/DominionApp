export class ChatMessage {
  playerName: string = '';
  content:    string = '';
  date:       Date   = new Date();

  constructor( initObj?: { playerName: string, content: string, timeStamp: number } ) {
    if ( !initObj ) return;
    this.playerName = initObj.playerName;
    this.content    = initObj.content;
    this.date       = new Date( initObj.timeStamp || Date.now() );
  }
}
