import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationSelector } from './generation-selector';

describe('GenerationSelector', () => {
  let component: GenerationSelector;
  let fixture: ComponentFixture<GenerationSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationSelector],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
