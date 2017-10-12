import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';

import { MessageDialogComponent  } from './message-dialog.component';
import { AlertDialogComponent    } from './alert-dialog.component';
import { ConfirmDialogComponent  } from './confirm-dialog.component';
import { WaitingSpinnerComponent } from './waiting-spinner.component';
import { AppListComponent        } from './app-list/app-list.component';
import { UtilitiesService        } from './utilities.service';

// data table
import { DataTableComponent    } from './data-table/data-table.component';
import { ResetButtonComponent  } from './data-table/reset-button.component';
import { ItemsPerPageComponent } from './data-table/items-per-page/items-per-page.component';
import { PagenationComponent   } from './data-table/pagenation/pagenation.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MyOwnCustomMaterialModule,
  ],
  exports: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    WaitingSpinnerComponent,
    AppListComponent,
    DataTableComponent,
    ResetButtonComponent,
    ItemsPerPageComponent,
    PagenationComponent,
  ],
  declarations: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    WaitingSpinnerComponent,
    AppListComponent,
    DataTableComponent,
    ResetButtonComponent,
    ItemsPerPageComponent,
    PagenationComponent,
  ],
  providers: [
    UtilitiesService,
  ],
  entryComponents: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
  ]
})
export class MyOwnLibraryModule { }