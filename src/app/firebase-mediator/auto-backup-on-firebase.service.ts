import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { toYMD, isToday } from '../my-own-library/utilities';


@Injectable()
export class AutoBackupOnFirebaseService {

  private autoBackupDir = '/autoBackup';
  private latestBackupDatePath = this.autoBackupDir + '/latestBackupDate';

  private fdPath = {
    users               : '/users',
    data                : '/data',
    randomizerGroupList : '/randomizerGroupList',
    onlineGameStateList : '/onlineGameStateList',
    onlineGameRoomsList : '/onlineGameRoomsList',
  };

  constructor(
    private afdb: AngularFireDatabase
  ) { }

  async checkAndExecuteBackup() {
    const latestBackupDate = await this.getLatestBackupDate();
    if ( !isToday( latestBackupDate ) ) {
      this.createBackup();
    }
  }

  private async getLatestBackupDate() {
    const timeStamp = await this.afdb.object<number>( this.latestBackupDatePath ).valueChanges().first().toPromise();
    return new Date( timeStamp );
  }

  private createBackup() {
    console.log('created backup');
    this.updateLatestBackupDate();

    const dateString = toYMD( new Date(), '' );

    Object.keys( this.fdPath ).forEach( key => {
      const sourcePath = this.fdPath[key];
      const distPathPrefix = `${this.autoBackupDir}/index/${dateString}`;
      this.afdb.object( sourcePath ).valueChanges().first().toPromise()
        .then( val => {
          if ( !val ) return;
          this.afdb.object(`${distPathPrefix}${sourcePath}`).set( val );
        });
    });
  }


  private updateLatestBackupDate() {
    return this.afdb.object( this.latestBackupDatePath ).set( Date.now() );
  }


}

