import {
    Component,
    ChangeDetectionStrategy,
    signal,
    inject,
    DestroyRef,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppHeader } from '../../shared/ui/app-header/app-header';
import { AppFooter } from '../../shared/ui/app-footer/app-footer';
import { NavGroup } from '../../shared/ui/mobile-menu/mobile-menu';
import { BlogService, Post } from '../../core/services/blog';

@Component({
    selector: 'app-blog-detail',
    imports: [RouterLink, DatePipe, AppHeader, AppFooter],
    templateUrl: './blog-detail.html',
    styleUrl: './blog-detail.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly blogService = inject(BlogService);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly post = signal<Post | null>(null);
    protected readonly isLoading = signal(true);
    protected readonly error = signal<string | null>(null);

    protected readonly navGroups: NavGroup[] = [
        {
            label: 'Product',
            items: [
                { label: 'Overview', href: '/' },
                { label: 'Pricing', href: '#' },
                { label: 'Marketplace', href: '#' },
                { label: 'Features', href: '#' },
                { label: 'Integrations', href: '#' },
            ],
        },
        {
            label: 'Company',
            items: [
                { label: 'About', href: '#' },
                { label: 'Team', href: '#' },
                { label: 'Blog', href: '/blogs' },
                { label: 'Careers', href: '#' },
            ],
        },
        {
            label: 'Connect',
            items: [
                { label: 'Contact', href: '#' },
                { label: 'Newsletter', href: '#' },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/angelumeh' },
            ],
        },
    ];

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        if (!id) {
            this.error.set('Post not found.');
            this.isLoading.set(false);
            return;
        }

        this.blogService
            .getBlogById(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (post) => {
                    this.post.set(post);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.error.set(
                        err.status === 404
                            ? 'This post could not be found.'
                            : 'Could not load post. Please try again.'
                    );
                    this.isLoading.set(false);
                },
            });
    }
}
