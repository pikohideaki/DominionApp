import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { CloudFirestoreMediatorService } from '../../firebase-mediator/cloud-firestore-mediator.service';


@Component({
  selector: 'app-selected-expansions',
  template: `
    <mat-chip-list>
      <mat-chip color="accent"
          *ngFor="let expansion of (expansions$ | async)"
          [selected]="expansion.selected" >
        {{expansion.name}}
      </mat-chip>
    </mat-chip-list>
  `,
  styles: []
})
export class SelectedExpansionsComponent implements OnInit {

  @Input() selectedExpansions: string[];
  expansions$: Observable<{ name: string, selected: boolean }[]>;


  constructor(
   private database: CloudFirestoreMediatorService
  ) {
  }

  ngOnInit() {
    this.expansions$
      = this.database.expansionsNameList$.map( namelist =>
            namelist.map( name => ({ name: name, selected: this.selectedExpansions.includes(name) }) ) );
  }

}
