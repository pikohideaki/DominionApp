import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.css']
})
export class AppListComponent implements OnInit {
  private alive = true;

  @Input() appName: string;
  @Input() apps$: Observable<{
          routerLink:  string,
          inService:   boolean,
          title:       string,
          subtitle:    string,
          description?: string
        }[]>;

  constructor() { }

  ngOnInit() {
  }
}
