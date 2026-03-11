import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    variant = input<'primary' | 'secondary' | 'ghost'>('primary');
    size = input<'sm' | 'md' | 'lg'>('md');
    disabled = input<boolean>(false);
    type = input<'button' | 'submit' | 'reset'>('button');
    ariaLabel = input<string>('');

    clicked = output<void>();

    protected classes = computed(() => ({
        'btn': true,
        [`btn--${this.variant()}`]: true,
        [`btn--${this.size()}`]: true,
        'btn--disabled': this.disabled()
    }));

    protected handleClick(): void {
        if (!this.disabled()) {
            this.clicked.emit();
        }
    }
}
