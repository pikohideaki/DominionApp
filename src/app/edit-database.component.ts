import { Component, OnInit } from '@angular/core';

import { AngularFirestore    } from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';

import { CardProperty } from './classes/card-property';


@Component({
  selector: 'app-edit-database',
  template: `
    <div *ngFor="let cardProp of cardPropertyList$ | async">
      {{cardProp.name_jp}}
    </div>
  `,
  styles: []
})
export class EditDatabaseComponent implements OnInit {

  cardPropertyList$;

  constructor(
    afs: AngularFirestore,
    afdb: AngularFireDatabase,
  ) {
    this.cardPropertyList$ = afdb.list<CardProperty>('data/cardPropertyList').valueChanges();
  }

  ngOnInit() {
  }

}
