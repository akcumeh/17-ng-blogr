import {
    Component,
    ChangeDetectionStrategy,
    signal,
    viewChild,
    ElementRef,
    AfterViewInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button/button';
import { AppHeader } from '../../shared/ui/app-header/app-header';
import { AppFooter } from '../../shared/ui/app-footer/app-footer';
import { Features } from '../features/features';
import { NavGroup } from '../../shared/ui/mobile-menu/mobile-menu';


@Component({
    selector: 'app-landing',
    imports: [RouterLink, ButtonComponent, AppHeader, AppFooter, Features],
    templateUrl: './landing.html',
    styleUrl: './landing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:scroll)': 'onScroll()'
    }
})

export class Landing implements AfterViewInit {
    protected isNavTransparent = signal(true);

    private featuresSectionRef = viewChild.required<ElementRef>('featuresSection');

    protected navGroups: NavGroup[] = [
        {
            label: 'Product',
            items: [
                {
                    label: 'Overview',
                    href: '/',
                    click: () => this.scrollToFeatures()
                },
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
                { label: 'Blog', href: '/blogs' },
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

    ngAfterViewInit(): void {
        this.onScroll();
    }

    protected onScroll(): void {
        const headerEl = document.querySelector<HTMLElement>('.header');
        const featuresSection = this.featuresSectionRef().nativeElement as HTMLElement;

        const navbarHeight = headerEl?.getBoundingClientRect().height ?? 0;
        const featuresSectionTop = featuresSection.getBoundingClientRect().top + window.scrollY;
        const threshold = featuresSectionTop - navbarHeight;

        this.isNavTransparent.set(window.scrollY < threshold);
    }

    protected scrollToFeatures(): void {
        const headerEl = document.querySelector<HTMLElement>('.header');
        const featuresSection = this.featuresSectionRef().nativeElement as HTMLElement;

        const navbarHeight = headerEl?.getBoundingClientRect().height ?? 0;
        const featuresSectionTop = featuresSection.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({ top: featuresSectionTop - navbarHeight, behavior: 'smooth' });
    }
}
