import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AngularFirestore    } from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';



@Injectable()
export class CloudFirestoreMediatorService {

  cardPropertyList$;

  constructor(
    afs: AngularFirestore,
    afdb: AngularFireDatabase,
  ) {
    this.cardPropertyList$ = afdb.list('data/cardPropertyList').valueChanges();
  }

}
