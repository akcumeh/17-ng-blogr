import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { SuccessModal } from '../../../shared/ui/success-modal/success-modal';
import { AuthService } from '../../../core/services/auth';

@Component({
    selector: 'app-signup',
    imports: [RouterLink, ButtonComponent, SuccessModal],
    templateUrl: './signup.html',
    styleUrl: './signup.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Signup {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);

    protected firstName = signal('');
    protected lastName = signal('');
    protected email = signal('');
    protected username = signal('');
    protected password = signal('');
    protected confirmPassword = signal('');

    protected firstNameError = signal('');
    protected lastNameError = signal('');
    protected emailError = signal('');
    protected usernameError = signal('');
    protected passwordError = signal('');
    protected confirmPasswordError = signal('');
    protected isSubmitting = signal(false);
    protected showSuccess = signal(false);
    protected generalError = signal('');

    protected handleSubmit(event: SubmitEvent): void {
        event.preventDefault();

        this.firstNameError.set('');
        this.lastNameError.set('');
        this.emailError.set('');
        this.usernameError.set('');
        this.passwordError.set('');
        this.confirmPasswordError.set('');
        this.generalError.set('');

        let hasErrors = false;

        if (!this.firstName()) {
            this.firstNameError.set('First name is required');
            hasErrors = true;
        }

        if (!this.lastName()) {
            this.lastNameError.set('Last name is required');
            hasErrors = true;
        }

        if (!this.email()) {
            this.emailError.set('Email is required');
            hasErrors = true;
        } else if (!this.isValidEmail(this.email())) {
            this.emailError.set('Please enter a valid email address');
            hasErrors = true;
        }

        if (!this.username()) {
            this.usernameError.set('Username is required');
            hasErrors = true;
        } else if (this.username().length < 2) {
            this.usernameError.set('Username must be at least 2 characters');
            hasErrors = true;
        }

        if (!this.password()) {
            this.passwordError.set('Password is required');
            hasErrors = true;
        } else if (this.password().length < 6) {
            this.passwordError.set('Password must be at least 6 characters');
            hasErrors = true;
        }

        if (!this.confirmPassword()) {
            this.confirmPasswordError.set('Please confirm your password');
            hasErrors = true;
        } else if (this.password() !== this.confirmPassword()) {
            this.confirmPasswordError.set('Passwords do not match');
            hasErrors = true;
        }

        if (hasErrors) return;

        this.isSubmitting.set(true);

        this.authService.register({
            firstName: this.firstName(),
            lastName: this.lastName(),
            email: this.email(),
            username: this.username(),
            password: this.password()
        }).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.showSuccess.set(true);
                setTimeout(() => this.router.navigate(['/login']), 5000);
            },
            error: (err: HttpErrorResponse) => {
                this.isSubmitting.set(false);
                this.generalError.set(
                    err.error?.error ?? 'Something went wrong. Please try again.'
                );
            }
        });
    }

    protected updateFirstName(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.firstName.set(target.value);
        if (this.firstNameError()) this.firstNameError.set('');
    }

    protected updateLastName(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.lastName.set(target.value);
        if (this.lastNameError()) this.lastNameError.set('');
    }

    protected updateEmail(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.email.set(target.value);
        if (this.emailError()) this.emailError.set('');
    }

    protected updateUsername(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.username.set(target.value);
        if (this.usernameError()) this.usernameError.set('');
    }

    protected updatePassword(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.password.set(target.value);
        if (this.passwordError()) this.passwordError.set('');
    }

    protected updateConfirmPassword(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.confirmPassword.set(target.value);
        if (this.confirmPasswordError()) this.confirmPasswordError.set('');
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
