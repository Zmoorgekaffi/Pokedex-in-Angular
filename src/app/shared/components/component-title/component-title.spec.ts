import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentTitle } from './component-title';

describe('ComponentTitle', () => {
  let component: ComponentTitle;
  let fixture: ComponentFixture<ComponentTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTitle],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentTitle);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title text', () => {
    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(heading.textContent).toContain('Test Title');
  });
});
