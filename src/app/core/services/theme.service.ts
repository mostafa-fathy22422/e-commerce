// src/app/core/services/theme.service.ts
import { inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private colorScheme: 'light' | 'dark' = 'light';
  private cookiesService: CookieService = inject(CookieService);
  private id = inject(PLATFORM_ID);
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  load() {
    if (isPlatformBrowser(this.id)) {
      this.colorScheme = (this.cookiesService.get('theme') as 'light' | 'dark') || 'light';
      this.updateTheme();
    }
  }

  updateTheme() {
    if (isPlatformBrowser(this.id)) {
      this.cookiesService.set('theme', this.colorScheme);
      if (this.colorScheme === 'dark') {
        this.renderer.addClass(document.documentElement, 'dark');
      } else {
        this.renderer.removeClass(document.documentElement, 'dark');
      }
    }
  }

  toggleTheme() {
    this.colorScheme = this.colorScheme === 'light' ? 'dark' : 'light';
    this.updateTheme();
  }
}
