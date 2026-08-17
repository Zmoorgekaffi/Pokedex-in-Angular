import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchBar } from './global-search-bar';

describe('GlobalSearchBar', () => {
  let component: GlobalSearchBar;
  let fixture: ComponentFixture<GlobalSearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalSearchBar],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalSearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
