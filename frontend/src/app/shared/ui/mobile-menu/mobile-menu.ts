import { Component, ChangeDetectionStrategy, computed, input, output, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
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
    imports: [ButtonComponent],
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
    }
}
