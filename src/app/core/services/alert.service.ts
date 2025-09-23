import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Alert {
  id: number;
  message: string;
  condition: number;
}
@Injectable({
  providedIn: 'root',
})
export class AlertService implements OnDestroy {
  // A private BehaviorSubject to hold the current list of alerts.
  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  // A public observable that components can subscribe to for updates.
  public readonly alerts$ = this.alertsSubject.asObservable();

  private nextId = 0;

  addAlert(condition: number, message: string) {
    const id = this.nextId++;
    const alert: Alert = { id, condition, message };

    // Add the new alert to the current list and emit the new state.
    const currentAlerts = this.alertsSubject.getValue();
    this.alertsSubject.next([...currentAlerts, alert]);

    // Automatically remove the alert after 5 seconds.
    setTimeout(() => {
      this.removeAlert(id);
    }, 2000);
  }

  removeAlert(id: number): void {
    // Filter out the alert with the given id and emit the new state.
    const currentAlerts = this.alertsSubject.getValue();
    this.alertsSubject.next(currentAlerts.filter((alert) => alert.id !== id));
  }

  ngOnDestroy() {
    this.alertsSubject.complete();
  }
}
