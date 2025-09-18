import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanPurposeChartComponent } from './loan-purpose-chart.component';

describe('LoanPurposeChartComponent', () => {
  let component: LoanPurposeChartComponent;
  let fixture: ComponentFixture<LoanPurposeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanPurposeChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoanPurposeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
