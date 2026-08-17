import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadMoreTrigger } from './load-more-trigger';

describe('LoadMoreTrigger', () => {
  let component: LoadMoreTrigger;
  let fixture: ComponentFixture<LoadMoreTrigger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadMoreTrigger],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadMoreTrigger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
