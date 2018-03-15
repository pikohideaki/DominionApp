import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { FireDatabaseService } from '../../firebase-mediator/cloud-firestore-mediator.service';


@Component({
  selector: 'app-selected-expansions',
  template: `
    <mat-chip-list *ngIf="(expansions$ | async) as expansions">
      <mat-chip color="accent"
          *ngFor="let expansion of expansions"
          [selected]="expansion.selected" >
        {{expansion.name}}
      </mat-chip>
    </mat-chip-list>
  `,
  styles: []
})
export class SelectedExpansionsComponent implements OnInit {

  @Input() selectedExpansionNameList$: Observable<string[]>;
  expansions$: Observable<{ name: string, selected: boolean }[]>;


  constructor(
   private database: FireDatabaseService
  ) {
  }

  ngOnInit() {
    this.expansions$ = Observable.combineLatest(
        this.database.expansionNameList$,
        this.selectedExpansionNameList$,
        (nameList, selectedNameList) =>
          nameList.map( name => ({ name: name, selected: selectedNameList.includes(name) }) ) );
  }
}
