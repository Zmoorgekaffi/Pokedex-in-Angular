import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilterBar } from './search-filter-bar';

describe('SearchFilterBar', () => {
  let component: SearchFilterBar;
  let fixture: ComponentFixture<SearchFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterBar],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchFilterBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
