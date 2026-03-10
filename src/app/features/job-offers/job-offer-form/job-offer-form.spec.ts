import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOfferForm } from './job-offer-form';

describe('JobOfferForm', () => {
  let component: JobOfferForm;
  let fixture: ComponentFixture<JobOfferForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOfferForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOfferForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
