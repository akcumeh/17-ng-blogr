import {
    Component,
    ChangeDetectionStrategy,
    signal,
    computed,
    inject,
    DestroyRef,
    OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppHeader } from '../../shared/ui/app-header/app-header';
import { AppFooter } from '../../shared/ui/app-footer/app-footer';
import { PostCard } from '../../shared/ui/post-card/post-card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { NavGroup } from '../../shared/ui/mobile-menu/mobile-menu';
import { BlogService, Post } from '../../core/services/blog';

@Component({
    selector: 'app-blogs',
    imports: [AppHeader, AppFooter, PostCard, ButtonComponent],
    templateUrl: './blogs.html',
    styleUrl: './blogs.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blogs implements OnInit {
    private readonly blogService = inject(BlogService);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly posts = signal<Post[]>([]);
    protected readonly currentPage = signal(1);
    protected readonly totalPages = signal(1);
    protected readonly isLoading = signal(false);
    protected readonly error = signal<string | null>(null);
    protected readonly isDesktop = signal(false);

    protected readonly hasPosts = computed(() => this.posts().length > 0);
    protected readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
    protected readonly paginationPages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const range = 2;
        const start = Math.max(1, current - range);
        const end = Math.min(total, current + range);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });

    protected navGroups: NavGroup[] = [
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
        this.isDesktop.set(window.innerWidth >= 1440);
        this.loadPage(1);
    }

    protected loadPage(page: number): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.blogService
            .getBlogs({ page, limit: 20 })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    if (!this.isDesktop() && page > 1) {
                        this.posts.update(existing => [...existing, ...response.posts]);
                    } else {
                        this.posts.set(response.posts);
                    }
                    this.currentPage.set(response.currentPage);
                    this.totalPages.set(response.totalPages);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.error.set('Could not load posts. Please try again.');
                    this.isLoading.set(false);
                },
            });
    }
}
