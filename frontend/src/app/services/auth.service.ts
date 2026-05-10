import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthRequest, AuthResponse, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl + '/auth';
    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());

    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
            tap(res => this.storeUser(res))
        );
    }

    login(request: AuthRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(res => this.storeUser(res))
        );
    }

    updateProfile(updates: any): Observable<AuthResponse> {
        return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, updates).pipe(
            tap(res => this.storeUser(res))
        );
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        return this.getCurrentUser()?.role === 'ADMIN';
    }

    private storeUser(res: AuthResponse): void {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        this.currentUserSubject.next(res);
    }

    private getStoredUser(): AuthResponse | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}