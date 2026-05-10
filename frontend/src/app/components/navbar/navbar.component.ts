import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models/user.model';
import { ThemeService } from '../../services/theme.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  currentUser: AuthResponse | null = null;

  constructor(private auth: AuthService, private router: Router, public theme: ThemeService) {
    this.auth.currentUser$.subscribe(user => this.currentUser = user);
  }

  getInitials(): string {
    if (!this.currentUser?.fullName) return '?';
    return this.currentUser.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}