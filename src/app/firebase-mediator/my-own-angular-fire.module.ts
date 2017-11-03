import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


/* angular material */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';


import { environment } from '../../environments/environment';

import { AngularFireModule         } from 'angularfire2';
import { AngularFireAuthModule     } from 'angularfire2/auth';
import { AngularFirestoreModule    } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { MyOwnLibraryModule } from '../my-own-library/my-own-library.module';

import { AutoBackupOnFirebaseService   } from './auto-backup-on-firebase.service';
import { MyUserInfoService             } from './my-user-info.service';
import { CloudFirestoreMediatorService } from './cloud-firestore-mediator.service';

import { EditDatabaseComponent         } from './edit-database.component';
import { UserAdminComponent            } from './user-admin/user-admin.component';
import { LoginComponent                } from './user-admin/login/login.component';
import { SignUpComponent               } from './user-admin/sign-up/sign-up.component';
import { MyPageComponent               } from './my-page.component';


@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    AngularFireModule.initializeApp(environment.firebase, 'DominionApp'), // imports firebase/app needed for everything
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireDatabaseModule, // imports firebase/firestore, only needed for database features
    MyOwnLibraryModule,
  ],
  declarations: [
    EditDatabaseComponent,
    UserAdminComponent,
    LoginComponent,
    SignUpComponent,
    MyPageComponent,
  ],
  providers: [
    MyUserInfoService,
    CloudFirestoreMediatorService,
    AutoBackupOnFirebaseService,
  ]
})
export class MyOwnAngularFireModule { }
