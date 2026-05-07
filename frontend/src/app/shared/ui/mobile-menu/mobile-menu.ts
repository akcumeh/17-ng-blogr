import { Component, ChangeDetectionStrategy, computed, effect, input, output, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { ButtonComponent } from '../button/button';
import { NavItem } from '../dropdown/dropdown';
import { AuthService } from '../../../core/services/auth';

export type { NavItem };

export interface NavGroup {
    label: string;
    items: NavItem[];
}

@Component({
    selector: 'app-mobile-menu',
    imports: [ButtonComponent, A11yModule],
    templateUrl: './mobile-menu.html',
    styleUrl: './mobile-menu.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenu {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    isOpen = input.required<boolean>();
    navGroups = input.required<NavGroup[]>();

    closed = output<void>();

    protected openDropdowns = signal<Set<string>>(new Set());
    protected currentUser = this.authService.currentUser;
    protected isAuthenticated = computed(() => !!this.currentUser());

    private _previousFocus: HTMLElement | null = null;

    constructor() {
        effect(() => {
            if (this.isOpen()) {
                this._previousFocus = document.activeElement as HTMLElement;
            }
        });
    }

    protected toggleDropdown(label: string): void {
        this.openDropdowns.update(current => {
            const newSet = new Set<string>();
            if (!current.has(label)) {
                newSet.add(label);
            }
            return newSet;
        });
    }

    protected isDropdownOpen(label: string): boolean {
        return this.openDropdowns().has(label);
    }

    protected navigateTo(path: string): void {
        this.handleClose();
        this.router.navigate([path]);
    }

    protected logout(): void {
        this.authService.logout();
        this.handleClose();
    }

    protected handleClose(): void {
        this.openDropdowns.set(new Set());
        this.closed.emit();
        this._previousFocus?.focus();
        this._previousFocus = null;
    }
}
