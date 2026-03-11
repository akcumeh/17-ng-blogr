import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../button/button';

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export interface NavItem {
    label: string;
    href: string;
}

@Component({
    selector: 'app-mobile-menu',
    imports: [ButtonComponent],
    templateUrl: './mobile-menu.html',
    styleUrl: './mobile-menu.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenu {
    isOpen = input.required<boolean>();
    navGroups = input.required<NavGroup[]>();

    closed = output<void>();

    protected openDropdowns = signal<Set<string>>(new Set());

    protected toggleDropdown(label: string): void {
        this.openDropdowns.update(current => {
            const newSet = new Set(current);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    }

    protected isDropdownOpen(label: string): boolean {
        return this.openDropdowns().has(label);
    }

    protected handleClose(): void {
        this.openDropdowns.set(new Set());
        this.closed.emit();
    }
}
