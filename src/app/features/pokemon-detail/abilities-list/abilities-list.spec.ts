import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbilitiesList } from './abilities-list';

describe('AbilitiesList', () => {
  let component: AbilitiesList;
  let fixture: ComponentFixture<AbilitiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbilitiesList],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbilitiesList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('abilities', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
