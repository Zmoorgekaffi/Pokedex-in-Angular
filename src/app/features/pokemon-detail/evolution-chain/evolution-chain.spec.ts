import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EvolutionChain } from './evolution-chain';

describe('EvolutionChain', () => {
  let component: EvolutionChain;
  let fixture: ComponentFixture<EvolutionChain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolutionChain],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolutionChain);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('chainId', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
