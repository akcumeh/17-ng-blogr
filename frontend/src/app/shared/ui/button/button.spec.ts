import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant as primary', () => {
    expect(component.variant()).toBe('primary');
  });

  it('should have default size as md', () => {
    expect(component.size()).toBe('md');
  });

  it('should emit clicked event when button is clicked and not disabled', () => {
    let clickEmitted = false;
    component.clicked.subscribe(() => {
      clickEmitted = true;
    });

    component.handleClick();
    expect(clickEmitted).toBe(true);
  });

  it('should not emit clicked event when button is disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let clickEmitted = false;
    component.clicked.subscribe(() => {
      clickEmitted = true;
    });

    component.handleClick();
    expect(clickEmitted).toBe(false);
  });
});
