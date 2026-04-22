import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PostAuthor {
    _id: string;
    first_name: string;
    last_name: string;
    username: string;
}

export interface Post {
    _id: string;
    title: string;
    description: string;
    body: string;
    author: PostAuthor;
    reading_time: number;
    tags: string[];
    state: 'published' | 'draft';
    read_count: number;
    createdAt: string;
}

export interface PostsResponse {
    posts: Post[];

    totalPages: number;
    currentPage: number;
}

export interface GetBlogsParams {
    page?: number;
    limit?: number;
    author?: string;
    title?: string;
    tags?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root',
})
export class BlogService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getBlogs(params: GetBlogsParams = {}): Observable<PostsResponse> {
        const defined = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined)
        ) as Record<string, string | number>;
        const httpParams = new HttpParams({ fromObject: defined as Record<string, string> });
        return this.http.get<PostsResponse>(`${this.apiUrl}/api/blogs`, { params: httpParams });
    }

    getBlogById(id: string): Observable<Post> {
        return this.http.get<Post>(`${this.apiUrl}/api/blogs/${id}`);
    }
}