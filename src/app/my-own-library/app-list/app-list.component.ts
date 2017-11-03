import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.css']
})
export class AppListComponent implements OnInit, OnDestroy {
  private alive = true;

  @Input() appName: string;
  @Input() apps$: Observable<{
          routerLink:  string,
          inService:   boolean,
          title:       string,
          subtitle:    string,
          description?: string
        }[]>;

  apps = [];

  constructor() { }

  ngOnInit() {
    this.apps$
      .takeWhile( () => this.alive )
      .subscribe( val => this.apps = val );
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
