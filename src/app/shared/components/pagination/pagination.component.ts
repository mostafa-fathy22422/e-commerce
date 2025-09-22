import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input() pages: number[] = [];
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  getPage(page: number) {
    this.pageChange.emit(page);
  }
}
