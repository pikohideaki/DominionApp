import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';
import { MyGameStateService } from '../my-game-state.service';

import { ChatMessage } from '../../../../classes/chat-message';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input() private sidenav;

  chatList$: Observable<ChatMessage[]>;
  newMessage: string = '';
  myName$: Observable<string>;
  disableSubmitButton = false;

  constructor(
    private myUserInfo: MyUserInfoService,
    private myGameState: MyGameStateService
  ) {
    this.myName$ = this.myUserInfo.name$;
    this.chatList$ = this.myGameState.chatList$;
  }

  ngOnInit() {
  }

  async submitMessage() {
    if ( this.newMessage === '' ) return;
    this.disableSubmitButton = true;
    await this.myGameState.addMessageToChatList( this.newMessage );
    this.newMessage = '';
    this.disableSubmitButton = false;
  }
}
