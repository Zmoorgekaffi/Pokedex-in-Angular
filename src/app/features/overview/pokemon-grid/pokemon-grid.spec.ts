import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PokemonGrid } from './pokemon-grid';

describe('PokemonGrid', () => {
  let component: PokemonGrid;
  let fixture: ComponentFixture<PokemonGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonGrid],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonGrid);
    fixture.componentRef.setInput('items', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
