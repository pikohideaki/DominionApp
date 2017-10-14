import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-table--pagenation',
  templateUrl: './pagenation.component.html',
  styleUrls: ['./pagenation.component.css']
})
export class PagenationComponent implements OnInit {

  @Input()  selectedPageIndex: number = 0;
  @Output() selectedPageIndexChange = new EventEmitter<number>();

  @Input() itemsPerPage: number = 25;
  @Input() dataSize: number = 0;


  constructor() { }

  ngOnInit() {
  }

  range() {
    return ({
      start : this.itemsPerPage * this.selectedPageIndex + 1,
      end   : Math.min( this.dataSize, (this.itemsPerPage * (this.selectedPageIndex + 1)) ),
    });
  }

  generatePageIndices() {  // dummy array to loop |dataSize/itemsPerPage| times
    return Array.from( new Array( this.pageLength() )).map( (_, i) => i );
  }

  pageLength(): number {
    return Math.ceil( this.dataSize / this.itemsPerPage );
  }

  setSelectedPageIndex( idx: number ): void {
    this.selectedPageIndexChange.emit( idx );
  }
  goToFirstPage():    void { this.setSelectedPageIndex( 0                          ); }
  goToPreviousPage(): void { this.setSelectedPageIndex( this.selectedPageIndex - 1 ); }
  goToNextPage():     void { this.setSelectedPageIndex( this.selectedPageIndex + 1 ); }
  goToLastPage():     void { this.setSelectedPageIndex( this.pageLength() - 1      ); }
}



export function getDataAtPage<T>(
    data: Array<T>, itemsPerPage: number, selectedPageIndex: number ): Array<T> {
  return data.slice( itemsPerPage * selectedPageIndex, itemsPerPage * (selectedPageIndex + 1) );
}

