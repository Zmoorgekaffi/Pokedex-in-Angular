import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonHeader } from './pokemon-header';

describe('PokemonHeader', () => {
  let component: PokemonHeader;
  let fixture: ComponentFixture<PokemonHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonHeader],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonHeader);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'bulbasaur');
    fixture.componentRef.setInput('id', 1);
    fixture.componentRef.setInput('spriteUrl', 'https://example.com/sprite.png');
    fixture.componentRef.setInput('types', ['grass', 'poison']);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
