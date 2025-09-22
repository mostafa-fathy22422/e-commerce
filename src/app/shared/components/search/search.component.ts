import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  search: string = '';
  // ? child==> parent searchEvent.emit(this.search)
  @Output() searchEvent: EventEmitter<string> = new EventEmitter();
}
