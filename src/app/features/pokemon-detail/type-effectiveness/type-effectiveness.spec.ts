import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeEffectiveness } from './type-effectiveness';

describe('TypeEffectiveness', () => {
  let component: TypeEffectiveness;
  let fixture: ComponentFixture<TypeEffectiveness>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeEffectiveness],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeEffectiveness);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('veryEffective', []);
    fixture.componentRef.setInput('effective', []);
    fixture.componentRef.setInput('resistant', []);
    fixture.componentRef.setInput('immune', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
