import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Post } from '../../../core/services/blog';

@Component({
    selector: 'app-post-card',
    imports: [RouterLink, DatePipe],
    templateUrl: './post-card.html',
    styleUrl: './post-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCard {
    post = input.required<Post>();
    featured = input<boolean>(false);
}
