import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="app-container">
      <app-loading-spinner></app-loading-spinner>
      
      <ng-container *ngIf="showLayout">
        <app-navbar></app-navbar>
        <app-sidebar></app-sidebar>
      </ng-container>

      <main [class.with-layout]="showLayout">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f7fa;
    }

    main {
      min-height: 100vh;
      transition: all 0.3s ease;

      &.with-layout {
        padding-top: 70px;
        padding-left: 260px;

        @media (max-width: 960px) {
          padding-left: 0;
        }
      }
    }
  `]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  showLayout = true;
  title = 'ResidenceHub';

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hideLayoutRoutes = ['/auth', '/unauthorized', '/404'];
        this.showLayout = !hideLayoutRoutes.some(route => event.url.includes(route));
      });
  }
}