import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { SuccessModal } from '../../../shared/ui/success-modal/success-modal';
import { AuthService } from '../../../core/services/auth';

@Component({
    selector: 'app-login',
    imports: [RouterLink, ButtonComponent, SuccessModal],
    templateUrl: './login.html',
    styleUrl: './login.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);

    protected email = signal('');
    protected password = signal('');
    protected emailError = signal('');
    protected passwordError = signal('');
    protected isSubmitting = signal(false);
    protected showSuccess = signal(false);
    protected generalError = signal('');

    protected handleSubmit(event: SubmitEvent): void {
        event.preventDefault();

        this.emailError.set('');
        this.passwordError.set('');
        this.generalError.set('');

        let hasErrors = false;

        if (!this.email()) {
            this.emailError.set('Email is required');
            hasErrors = true;
        } else if (!this.isValidEmail(this.email())) {
            this.emailError.set('Please enter a valid email address');
            hasErrors = true;
        }

        if (!this.password()) {
            this.passwordError.set('Password is required');
            hasErrors = true;
        } else if (this.password().length < 6) {
            this.passwordError.set('Password must be at least 6 characters');
            hasErrors = true;
        }

        if (hasErrors) return;

        this.isSubmitting.set(true);

        this.authService.login(this.email(), this.password()).pipe(
            switchMap((response) => {
                this.authService.storeToken(response.token);
                return this.authService.fetchCurrentUser();
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (user) => {
                this.authService.setUser(user);
                this.isSubmitting.set(false);
                this.showSuccess.set(true);
                setTimeout(() => this.router.navigate(['/']), 5000);
            },
            error: (err: HttpErrorResponse) => {
                this.isSubmitting.set(false);
                const isClientError = err.status >= 400 && err.status < 500;
                this.generalError.set(
                    isClientError
                        ? (err.error?.error ?? 'Wrong email address or password.')
                        : 'Something went wrong. Please try again later.'
                );
            }
        });
    }

    protected updateEmail(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.email.set(target.value);
        if (this.emailError()) this.emailError.set('');
    }

    protected updatePassword(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.password.set(target.value);
        if (this.passwordError()) this.passwordError.set('');
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
