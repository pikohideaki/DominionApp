import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { MyUserInfoService } from './firebase-mediator/my-user-info.service';


@Component({
  selector: 'app-home',
  template: `
    <div class="body-with-padding">
      <app-list appName="Dominion Apps" [apps$]="apps$" > </app-list>
    </div>
  `,
  styles: [],
})
export class HomeComponent implements OnInit {

  apps$: Observable<{
      routerLink:  string,
      inService:   boolean,
      title:       string,
      subtitle:    string,
      description?: string
    }[]>;

  constructor(
    private myUserInfo: MyUserInfoService
  ) {
    this.apps$ = this.myUserInfo.signedIn$.map( signedIn => [
        {
          routerLink: '/online-game',
          inService:  signedIn,
          title:      'Online Game',
          subtitle:   'Dominion オンライン対戦',
          description: ( signedIn ? '' : '（※要ログイン）'),
        },
        {
          routerLink: '/online-randomizer',
          inService:  signedIn,
          title:      'Randomizer Online',
          subtitle:   'サプライ生成＆ゲーム結果追加（グループ同期機能付き）',
          description: ( signedIn ? '' : '（※要ログイン）'),
        },
        { routerLink: '/game-result', inService: true, title: 'Game Result List', subtitle: '成績表', },
        { routerLink: '/cardlist'   , inService: true, title: 'Card List'       , subtitle: 'カード一覧表', },
        { routerLink: '/rulebooks'  , inService: true, title: 'RuleBooks'       , subtitle: 'Dominionのルールブック(PDF)', },
      ] );
  }

  ngOnInit() {
  }
}
