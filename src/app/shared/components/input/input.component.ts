import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
})
export class InputComponent {
  @Input() control: any;
  @Input() label: string = '';
  @Input() type: string = '';
  @Input() id: string = '';
}
