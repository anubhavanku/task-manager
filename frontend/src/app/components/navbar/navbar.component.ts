import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models/user.model';
import { ThemeService } from '../../services/theme.service';
import { ConfirmService } from '../../services/confirm.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  currentUser: AuthResponse | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    public theme: ThemeService,
    private confirm: ConfirmService
  ) {
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
    this.confirm.confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      confirmColor: 'warn'
    }).subscribe(result => {
      if (!result) return;
      this.auth.logout();
      this.router.navigate(['/login']);
    });
  }
}