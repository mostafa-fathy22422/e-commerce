import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AlertService } from './core/services/alert.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AlertComponent } from './shared/components/alert/alert.component';
import { RouterOutlet } from '@angular/router';
import { WishListComponent } from './features/wish-list/wish-list.component';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, AlertComponent, RouterOutlet, WishListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  WishList!: boolean;
  isLogin: boolean = false;
  private authService = inject(AuthService);
  constructor(
    protected alertService: AlertService,
    private themeService: ThemeService,
  ) {}

  showWishList($event: boolean) {
    this.WishList = $event;
  }
  ngOnInit() {
    this.themeService.load();
    this.authService.isLoggedIn().subscribe({
      next: (res) => {
        this.isLogin = res;
        if (this.isLogin) {
        }
      },
      error: (err) => {
        console.error('Error in auth state subscription:', err);
      },
    });
  }
}
