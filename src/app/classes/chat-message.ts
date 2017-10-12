export class ChatMessage {
  userName: string = '';
  content: string = '';
  date: Date = new Date();

  constructor( initObj?: { userName: string, content: string, timeStamp: number } ) {
    if ( !initObj ) return;
    this.userName = initObj.userName;
    this.content  = initObj.content;
    this.date     = new Date( initObj.timeStamp || Date.now() );
  }
}
