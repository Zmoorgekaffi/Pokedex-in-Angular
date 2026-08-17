import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseStats } from './base-stats';

describe('BaseStats', () => {
  let component: BaseStats;
  let fixture: ComponentFixture<BaseStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseStats],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseStats);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stats', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
