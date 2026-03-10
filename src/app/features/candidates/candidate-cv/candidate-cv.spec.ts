import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateCv } from './candidate-cv';

describe('CandidateCv', () => {
  let component: CandidateCv;
  let fixture: ComponentFixture<CandidateCv>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateCv]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateCv);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
