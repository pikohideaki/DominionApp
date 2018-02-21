import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { AngularFireAuth } from 'angularfire2/auth';

import { CloudFirestoreMediatorService } from '../../cloud-firestore-mediator.service';

import { User } from '../../../classes/user';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  waitingForResponse = false;

  email:    string;
  password: string;
  name:     string;
  nameYomi: string;

  errorMessageForEmail: string;
  errorMessageForPassword: string;


  constructor(
    public snackBar: MatSnackBar,
    public afAuth: AngularFireAuth,
    private location: Location,
    private database: CloudFirestoreMediatorService
  ) {
  }

  ngOnInit() {
  }


  emailOnChange( value ) {
    this.email = value;
  }

  passwordOnChange( value ) {
    this.password = value;
  }

  nameOnChange( value ) {
    this.name = value;
  }

  nameYomiOnChange( value ) {
    this.nameYomi = value;
  }


  async signUp() {
    const expansionNameList
      = await this.database.expansionNameList$.first().toPromise();
    const isSelectedExpansionsInit = expansionNameList.map( _ => true );

    this.errorMessageForEmail = '';
    this.errorMessageForPassword = '';

    this.waitingForResponse = true;
    this.afAuth.auth.createUserWithEmailAndPassword( this.email, this.password )
    .then( afUser => {
      this.waitingForResponse = false;

      this.database.user.setUser(
          afUser.uid,
          new User( afUser.uid, {
            name:     this.name,
            nameYomi: this.nameYomi,
            randomizerGroupId: '',
            onlineGame: {
              isSelectedExpansions: expansionNameList.map( _ => true ),
              numberOfPlayers:       2,
              roomId:               '',
              communicationId:      '',
              chatOpened:           true,
              cardSizeAutoChange:   true,
              cardSizeRatio:        1,
              messageSpeed:         1,
            }
          } ) );

      this.location.back();
      this.openSnackBar('Successfully logged in!');
    } )
    .catch( (error: any) => {
      this.waitingForResponse = false;

      switch ( error.code ) {
        case 'auth/email-already-in-use' :
          this.errorMessageForEmail = error.message;
          break;
        case 'auth/invalid-email' :
          this.errorMessageForEmail = error.message;
          break;
        case 'auth/operation-not-allowed' :
          this.errorMessageForEmail = error.message;
          break;
        case 'auth/weak-password' :
          this.errorMessageForPassword = error.message;
          break;
        default :
          this.errorMessageForEmail = error.message;
          break;
      }
    } );
  }

  // private setDisplayName() {
  //   this.afAuth.auth.currentUser.updateProfile( { displayName: this.name, photoURL: '' } );
  // }


  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }
}
