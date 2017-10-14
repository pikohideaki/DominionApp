import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { EditDatabaseComponent     } from './firebase-mediator/edit-database.component';
import { HomeComponent             } from './home.component';
import { UserAdminComponent        } from './firebase-mediator/user-admin/user-admin.component';
import { MyPageComponent           } from './firebase-mediator/my-page.component';


import { OnlineRandomizerComponent } from './dominion/online-randomizer/online-randomizer.component';
import { GameResultComponent       } from './dominion/game-result/game-result.component';
import { CardPropertyListComponent } from './dominion/card-property-list.component';
import { RuleBooksComponent        } from './dominion/rule-books.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot([
      { component: EditDatabaseComponent,     path: 'edit-database'     },
      { component: HomeComponent,             path: ''                  },
      { component: UserAdminComponent,        path: 'user-admin'        },
      { component: MyPageComponent,           path: 'my-page'           },
      { component: OnlineRandomizerComponent, path: 'online-randomizer' },
      { component: GameResultComponent,       path: 'game-result'       },
      { component: CardPropertyListComponent, path: 'cardlist'          },
      { component: RuleBooksComponent,        path: 'rulebooks'         },
    ], { useHash: true } ),
  ],
  exports: [
    RouterModule,
  ],
  declarations: [
    EditDatabaseComponent,
  ]
})
export class AppRoutingModule { }
