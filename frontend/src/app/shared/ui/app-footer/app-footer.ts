import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NavGroup } from '../mobile-menu/mobile-menu';

@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './app-footer.html',
    styleUrl: './app-footer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFooter {
    navGroups = input.required<NavGroup[]>();
}
