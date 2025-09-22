import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LongService {
  private readonly direction: BehaviorSubject<string> = new BehaviorSubject(<string>'ltr');
  direction$ = this.direction.asObservable();
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    this.translate.use('en');
  }

  changeDirection(long: string) {
    let direction = long == 'ar' ? 'rtl' : 'ltr';
    this.direction.next(direction);
    document.documentElement.dir = direction;
    this.translate.use(long).subscribe();
    document.documentElement.lang = long;
  }
}
