import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveTooltip } from './move-tooltip';

describe('MoveTooltip', () => {
  let component: MoveTooltip;
  let fixture: ComponentFixture<MoveTooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveTooltip],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveTooltip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
