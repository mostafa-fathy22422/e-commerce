import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CookiesServiceHandel {
  getCookie(cookie: string, cname: string) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
}
