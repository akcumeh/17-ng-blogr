import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/ui/button/button';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown';
import { MobileMenu, NavGroup } from '../../shared/ui/mobile-menu/mobile-menu';

@Component({
    selector: 'app-landing',
    imports: [ButtonComponent, DropdownComponent, MobileMenu],
    templateUrl: './landing.html',
    styleUrl: './landing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Landing {
}
