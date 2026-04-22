import { Component, ChangeDetectionStrategy, input, signal, output } from '@angular/core';

export interface NavItem {
    label: string;
    href: string;
    click?: () => void;
}

@Component({
    selector: 'app-dropdown',
    imports: [],
    templateUrl: './dropdown.html',
    styleUrl: './dropdown.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent {
    label = input.required<string>();
    items = input.required<NavItem[]>();
    opened = output<string>();

    protected isOpen = signal(false);
    protected isClosing = signal(false);

    protected toggle(): void {
        if (this.isOpen()) {
            this.startClosing();
        } else {
            this.isOpen.set(true);
            this.isClosing.set(false);
            this.opened.emit(this.label());
        }
    }

    public close(): void {
        if (this.isOpen() && !this.isClosing()) {
            this.startClosing();
        }
    }

    protected handleItemClick(item: NavItem, event: Event): void {
        if (item.click) {
            event.preventDefault();
            item.click();
            this.startClosing();
        }
    }

    private startClosing(): void {
        this.isClosing.set(true);
        setTimeout(() => {
            this.isOpen.set(false);
            this.isClosing.set(false);
        }, 500);
    }
}
