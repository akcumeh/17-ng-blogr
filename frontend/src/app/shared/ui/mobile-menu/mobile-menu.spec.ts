import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileMenu } from './mobile-menu';

describe('MobileMenu', () => {
    let component: MobileMenu;
    let fixture: ComponentFixture<MobileMenu>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MobileMenu],
        }).compileComponents();

        fixture = TestBed.createComponent(MobileMenu);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
