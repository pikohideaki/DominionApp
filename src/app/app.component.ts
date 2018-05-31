import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { UserService } from './firebase-mediator/user.service';
import { AutoBackupOnFirebaseService } from './firebase-mediator/auto-backup-on-firebase.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  signedIn$: Observable<boolean> = this.user.signedIn$;
  myName$:   Observable<string>  = this.user.name$;



  constructor(
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private user: UserService,
    private autoBackup: AutoBackupOnFirebaseService,
    private router: Router,
  ) {
    this.autoBackup.checkAndExecuteBackup();
  }


  async logout() {
    if ( !this.afAuth.auth.currentUser ) return;
    await this.afAuth.auth.signOut();
    this.router.navigate( ['/'] );
    this.openSnackBar('Successfully signed out!');
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }

}
