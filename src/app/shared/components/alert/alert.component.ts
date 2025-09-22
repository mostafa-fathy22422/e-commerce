import { Component, inject } from '@angular/core';
import { Alert, AlertService } from '../../../core/services/alert.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-alert',
  imports: [AsyncPipe],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  standalone: true, // Assuming this component is standalone
})
export class AlertComponent {
  // Inject the service
  public alertService = inject(AlertService);

  // Create an observable property for the alerts
  public alerts$: Observable<Alert[]> = this.alertService.alerts$;
}
