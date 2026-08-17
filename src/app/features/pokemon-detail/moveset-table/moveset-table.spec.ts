import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MovesetTable } from './moveset-table';

describe('MovesetTable', () => {
  let component: MovesetTable;
  let fixture: ComponentFixture<MovesetTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovesetTable],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovesetTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('moves', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
