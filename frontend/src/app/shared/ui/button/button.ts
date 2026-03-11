import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    variant = input<'primary' | 'secondary' | 'ghost' | 'filled'>('primary');
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
