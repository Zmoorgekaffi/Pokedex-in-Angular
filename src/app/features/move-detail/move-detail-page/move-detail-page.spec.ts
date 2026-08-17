import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveDetailPage } from './move-detail-page';

describe('MoveDetailPage', () => {
  let component: MoveDetailPage;
  let fixture: ComponentFixture<MoveDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveDetailPage],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
