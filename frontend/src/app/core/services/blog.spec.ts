import { TestBed } from '@angular/core/testing';

import { Blog } from './blog';

describe('Blog', () => {
    let service: Blog;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Blog);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
