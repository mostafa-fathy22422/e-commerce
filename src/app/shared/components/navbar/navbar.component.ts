// navbar.component.ts
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NavLink } from '../../../core/models/nav-link.interface';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { WishListService } from '../../../core/services/wish-list/wish-list.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LongService } from '../../../core/services/long.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnDestroy, OnChanges, OnInit {
  isLogin: boolean = false;
  isDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  WishList: boolean = false;
  currentLang: string = 'en';
  WishListCount: number = 0;
  @Output() showWishList: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() showWishListChange!: boolean;

  @ViewChild('dropdownMenu', { static: false })
  dropdownMenu!: ElementRef;
  @ViewChild('dropdownButton', { static: false })
  dropdownButton!: ElementRef;
  navItems: NavLink[] = [
    { name: 'navbar.Home', link: '/home' },
    { name: 'navbar.Products', link: '/products' },
    // { name: 'Categories', link: '/categories' },
    { name: 'navbar.Brands', link: '/brands' },
    { name: 'navbar.All_Orders', link: '/allorders' },
    { name: 'navbar.Cart', link: '/cart' },
  ];
  authItems: NavLink[] = [
    { name: 'navbar.Login', link: '/login' },
    { name: 'navbar.Register', link: '/register' },
  ];
  private outsideClickListener?: () => void;
  private longService = inject(LongService);
  constructor(
    private authService: AuthService,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private wishListService: WishListService, // Inject TranslateService

    // private cdr: ChangeDetectorRef
  ) {
    // this.translate.addLangs(['en', 'ar']);
    // Initialize currentLang from the translate service
    // this.currentLang = this.translate.currentLang || this.translate.defaultLang;
  }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: (res) => {
        this.isLogin = res;
        if (this.isLogin) {
          this.wishListService.initializeWishList(); // Initialize the wishlist state
          this.getWishListCount();
        } else {
          //this.getWishListCount();
        }
      },
      error: (err) => {
        console.error('Error in auth state subscription:', err);
      },
    });
    this.wishListService.wishListUpdated$.subscribe(() => {
      this.getWishListCount();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showWishListChange']) {
      this.WishList = changes['showWishListChange'].currentValue;
    }
  }

  ngOnDestroy(): void {
    if (this.outsideClickListener) {
      this.outsideClickListener();
    }
  }

  toggleMode() {
    this.themeService.toggleTheme();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen) {
      // Add outside click listener when dropdown opens
      this.outsideClickListener = this.renderer.listen('document', 'click', (event) => {
        if (!this.isInsideDropdown(event.target)) {
          this.isDropdownOpen = false;
        }
      });
    } else if (this.outsideClickListener) {
      // Remove listener when dropdown closes
      this.outsideClickListener();
      this.outsideClickListener = undefined;
    }
  }

  logout() {
    this.authService.logout();
  }

  toggleWishList() {
    this.showWishList.emit(true);
  }

  toggleLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.currentLang = newLang;
    console.log('Language changed to:', newLang);
    this.longService.changeDirection(newLang);
  }

  private isInsideDropdown(target: any): boolean {
    if (!this.dropdownMenu || !this.dropdownButton) {
      return false;
    }

    return (
      this.dropdownMenu.nativeElement.contains(target) ||
      this.dropdownButton.nativeElement.contains(target)
    );
  }

  private getWishListCount() {
    this.wishListService.getWishList().subscribe({
      next: (res) => {
        this.WishListCount = res.count;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
