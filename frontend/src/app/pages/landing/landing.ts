import { Component, ChangeDetectionStrategy, signal, viewChildren, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button/button';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown';
import { MobileMenu, NavGroup } from '../../shared/ui/mobile-menu/mobile-menu';
import { Features } from '../features/features';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-landing',
    imports: [RouterLink, ButtonComponent, DropdownComponent, MobileMenu, Features],
    templateUrl: './landing.html',
    styleUrl: './landing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Landing {
    private authService = inject(AuthService);

    protected isMobileMenuOpen = signal(false);
    private dropdowns = viewChildren(DropdownComponent);
    protected currentUser = this.authService.currentUser;
    protected isAuthenticated = computed(() => !!this.currentUser());

    protected navGroups: NavGroup[] = [
        {
            label: 'Product',
            items: [
                { label: 'Overview', href: '#' },
                { label: 'Pricing', href: '#' },
                { label: 'Marketplace', href: '#' },
                { label: 'Features', href: '#' },
                { label: 'Integrations', href: '#' }
            ]
        },
        {
            label: 'Company',
            items: [
                { label: 'About', href: '#' },
                { label: 'Team', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Careers', href: '#' }
            ]
        },
        {
            label: 'Connect',
            items: [
                { label: 'Contact', href: '#' },
                { label: 'Newsletter', href: '#' },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/angelumeh' }
            ]
        }
    ];

    protected toggleMobileMenu(): void {
        this.isMobileMenuOpen.update(value => !value);
    }

    protected closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
    }

    protected scrollToFeatures(): void {
        const featuresSection = document.querySelector('app-features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    protected onDropdownOpened(openedLabel: string): void {
        this.dropdowns().forEach(dropdown => {
            if (dropdown.label() !== openedLabel) {
                dropdown.close();
            }
        });
    }

    protected logout(): void {
        this.authService.logout();
    }
}
