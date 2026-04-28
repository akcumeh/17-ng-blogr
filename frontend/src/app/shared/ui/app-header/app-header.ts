import {
    Component,
    ChangeDetectionStrategy,
    signal,
    computed,
    input,
    viewChildren,
    inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button';
import { DropdownComponent } from '../dropdown/dropdown';
import { MobileMenu, NavGroup } from '../mobile-menu/mobile-menu';
import { AuthService } from '../../../core/services/auth';

export type { NavGroup };

@Component({
    selector: 'app-header',
    imports: [ButtonComponent, DropdownComponent, MobileMenu],
    templateUrl: './app-header.html',
    styleUrl: './app-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    navGroups = input.required<NavGroup[]>();
    transparent = input<boolean>(false);

    protected isMobileMenuOpen = signal(false);
    private dropdowns = viewChildren(DropdownComponent);

    protected currentUser = this.authService.currentUser;
    protected isAuthenticated = computed(() => !!this.currentUser());

    protected toggleMobileMenu(): void {
        this.isMobileMenuOpen.update(v => !v);
    }

    protected closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
    }

    protected onDropdownOpened(openedLabel: string): void {
        this.dropdowns().forEach(dropdown => {
            if (dropdown.label() !== openedLabel) {
                dropdown.close();
            }
        });
    }

    protected navigateTo(path: string): void {
        this.router.navigate([path]);
    }

    protected logout(): void {
        this.authService.logout();
    }
}
