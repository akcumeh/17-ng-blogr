import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
    selector: 'app-success-modal',
    imports: [],
    templateUrl: './success-modal.html',
    styleUrl: './success-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessModal {
    message = input.required<string>();
    closed = output<void>();
}
