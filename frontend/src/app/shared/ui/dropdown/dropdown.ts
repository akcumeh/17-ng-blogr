import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';

interface NavItem {
    label: string;
    href: string;
}

@Component({
    selector: 'app-dropdown',
    imports: [NgClass],
    templateUrl: './dropdown.html',
    styleUrl: './dropdown.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent {
    label = input.required<string>();
    items = input.required<NavItem[]>();

    protected isOpen = signal(false);

    protected toggle(): void {
        this.isOpen.update(v => !v);
    }

    protected close(): void {
        this.isOpen.set(false);
    }
}
