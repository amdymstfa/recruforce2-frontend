import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOfferDetail } from './job-offer-detail';

describe('JobOfferDetail', () => {
  let component: JobOfferDetail;
  let fixture: ComponentFixture<JobOfferDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOfferDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOfferDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
