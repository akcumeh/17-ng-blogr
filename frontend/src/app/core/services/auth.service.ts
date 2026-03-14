import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
}

interface LoginResponse {
    token: string;
}

interface RegisterResponse {
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly AUTH_TOKEN_KEY = 'blogr_auth_token';
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    currentUser = signal<User | null>(null);

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/signin`, { email, password });
    }

    register(data: {
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        password: string;
    }): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/api/auth/signup`, data);
    }

    fetchCurrentUser(): Observable<User> {
        const token = this.getToken();
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get<User>(`${this.apiUrl}/api/auth/me`, { headers });
    }

    initialize(): Observable<User | null> {
        if (!this.getToken()) {
            return of(null);
        }
        return this.fetchCurrentUser().pipe(
            tap((user) => this.currentUser.set(user)),
            catchError(() => {
                this.logout();
                return of(null);
            })
        );
    }

    storeToken(token: string): void {
        localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    }

    setUser(user: User): void {
        this.currentUser.set(user);
    }

    logout(): void {
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
        this.currentUser.set(null);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem(this.AUTH_TOKEN_KEY);
    }

    getToken(): string | null {
        return localStorage.getItem(this.AUTH_TOKEN_KEY);
    }
}
