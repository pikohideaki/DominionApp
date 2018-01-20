import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ChatMessage } from '../../../../classes/chat-message';
import { MyUserInfoService } from '../../../../firebase-mediator/my-user-info.service';
import { GameRoomCommunicationService } from '../game-room-communication.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
  private alive: boolean = true;

  @Input() sidenav;
  @Input() autoScroll: boolean = true;

  chatList$: Observable<ChatMessage[]>;
  myName$: Observable<string>;

  newMessage: string = '';
  disableSubmitButton = false;  // 連打防止


  constructor(
    private myUserInfo: MyUserInfoService,
    private gameCommunication: GameRoomCommunicationService,
  ) {
    // observables
    this.myName$ = this.myUserInfo.name$;
    this.chatList$ = this.gameCommunication.chatList$;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // auto scroll when view changed
    const target = document.getElementById('chat-list');
    const observer = new MutationObserver( _ => {
      const $chatListElements = document.getElementsByClassName('chat-list-element');
      if ( !this.autoScroll || $chatListElements.length <= 0 ) return;
      const $lastElement = $chatListElements[ $chatListElements.length - 1 ];
      $lastElement.scrollIntoView(true);
    });
    observer.observe( target, { childList: true } );
  }

  async submitMessage() {
    if ( !this.newMessage ) return;
    this.disableSubmitButton = true;
    await this.gameCommunication.addMessage( this.newMessage );
    this.newMessage = '';
    this.disableSubmitButton = false;
  }

  messageOnChange( message: string ) {
    this.newMessage = (message || '');
  }
}
