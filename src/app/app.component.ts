import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { MyUserInfoService } from './firebase-mediator/my-user-info.service';
import { AutoBackupOnFirebaseService } from './firebase-mediator/auto-backup-on-firebase.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  signedIn$: Observable<boolean> = this.myUserInfo.signedIn$;
  myName$:   Observable<string>  = this.myUserInfo.name$;


  constructor(
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private myUserInfo: MyUserInfoService,
    private autoBackup: AutoBackupOnFirebaseService,
  ) {
    this.autoBackup.checkAndExecuteBackup();
  }


  logout() {
    if ( !this.afAuth.auth.currentUser ) return;
    this.afAuth.auth.signOut()
    .then( () => this.openSnackBar('Successfully signed out!') );
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }

}
