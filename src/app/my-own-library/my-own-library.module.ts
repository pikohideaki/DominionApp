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
import { ItemsPerPageComponent } from './data-table/items-per-page.component';
import { PagenationComponent   } from './data-table/pagenation/pagenation.component';
import { DataTableComponent   } from './data-table/data-table.component';
import { MultipleDatePickerComponent } from './multiple-date-picker/multiple-date-picker.component';
import { ToggleFullscreenDirective } from './toggle-fullscreen.directive';
import { FullScreenService } from './full-screen.service';


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
    ItemsPerPageComponent,
    PagenationComponent,
    MultipleDatePickerComponent,
    ToggleFullscreenDirective,
  ],
  declarations: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    WaitingSpinnerComponent,
    AppListComponent,
    DataTableComponent,
    ItemsPerPageComponent,
    PagenationComponent,
    MultipleDatePickerComponent,
    ToggleFullscreenDirective,
  ],
  providers: [
    UtilitiesService,
    FullScreenService,
  ],
  entryComponents: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
  ]
})
export class MyOwnLibraryModule { }
