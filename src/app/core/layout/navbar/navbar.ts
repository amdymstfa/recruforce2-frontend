import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;
  mobileOpen = signal(false);
  currentPath = signal('');

  navItems = [
    { label: 'Dashboard',    route: '/dashboard',    roles: ['ADMIN', 'RECRUITER', 'MANAGER'] },
    { label: 'Candidats',    route: '/candidates',   roles: ['ADMIN', 'RECRUITER', 'MANAGER'] },
    { label: 'Offres',       route: '/job-offers',   roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Candidatures', route: '/applications', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Entretiens',   route: '/interviews',   roles: ['ADMIN', 'RECRUITER', 'MANAGER'] },
    { label: 'Admin',        route: '/admin/users',  roles: ['ADMIN'] },
  ];

  constructor() {
    this.currentPath.set(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => this.currentPath.set(e.urlAfterRedirects));
  }

  visibleItems() {
    const role = this.user()?.role ?? '';
    return this.navItems.filter(item => item.roles.includes(role));
  }

  isActive(route: string): boolean {
    return this.currentPath().startsWith(route);
  }

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getInitials(): string {
    const u = this.user();
    if (!u) return '??';
    return `${u.firstName?.charAt(0) ?? ''}${u.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }

  getRoleLabel(): string {
    const map: Record<string, string> = {
      ADMIN: 'Admin', RECRUITER: 'Recruteur', MANAGER: 'Manager'
    };
    return map[this.user()?.role ?? ''] ?? '';
  }
}
