import { Component, OnInit } from '@angular/core';
import { FullScreenService } from '../../my-own-library/full-screen.service';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.css']
})
export class UserAdminComponent implements OnInit {

  isFullscreen$ = this.fullscreen.isFullscreen$;


  constructor(
    private fullscreen: FullScreenService
  ) { }

  ngOnInit() {
  }

}
