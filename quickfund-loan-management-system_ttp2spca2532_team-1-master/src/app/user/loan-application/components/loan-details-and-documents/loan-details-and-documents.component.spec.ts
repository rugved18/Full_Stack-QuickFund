import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDetailsAndDocumentsComponent } from './loan-details-and-documents.component';

describe('LoanDetailsAndDocumentsComponent', () => {
  let component: LoanDetailsAndDocumentsComponent;
  let fixture: ComponentFixture<LoanDetailsAndDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanDetailsAndDocumentsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoanDetailsAndDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
