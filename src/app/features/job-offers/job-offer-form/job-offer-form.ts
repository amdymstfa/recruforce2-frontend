import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { JobOffer } from '../../../core/models';

@Component({
  selector: 'app-job-offer-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './job-offer-form.html',
  styleUrl: './job-offer-form.scss'
})
export class JobOfferFormComponent implements OnInit {
  private api    = inject(ApiService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);

  loading  = signal(false);
  error    = signal<string | null>(null);
  isEdit   = signal(false);
  offerId  = signal<number | null>(null);

  form = this.fb.group({
    title:             ['', Validators.required],
    description:       ['', Validators.required],
    location:          ['', Validators.required],
    contractType:      ['CDI', Validators.required],
    minExperience:     [0,  Validators.required],
    maxExperience:     [5,  Validators.required],
    minSalary:         [30000, Validators.required],
    maxSalary:         [50000, Validators.required],
    expirationDate:    ['', Validators.required],
    publishOnLinkedin: [false],
  });

  contractTypes = ['CDI', 'CDD', 'STAGE', 'FREELANCE', 'ALTERNANCE'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.offerId.set(+id);
      this.api.get<JobOffer>(`job-offers/${id}`).subscribe({
        next: (offer) => {
          this.form.patchValue({
            title:             offer.title,
            description:       offer.description,
            location:          offer.location,
            contractType:      offer.contractType,
            minExperience:     offer.minExperience,
            maxExperience:     offer.maxExperience,
            minSalary:         offer.minSalary,
            maxSalary:         offer.maxSalary,
            expirationDate:    offer.expirationDate?.substring(0, 10) ?? '',
            publishOnLinkedin: offer.publishedOnLinkedin,
          });
        },
        error: () => this.error.set('Erreur lors du chargement')
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);

    const payload = { ...this.form.value, requiredSkillIds: [] };

    const request$ = this.isEdit()
      ? this.api.put<JobOffer>(`job-offers/${this.offerId()}`, payload)
      : this.api.post<JobOffer>('job-offers', { ...payload, status: 'DRAFT' });

    request$.subscribe({
      next: (offer) => this.router.navigate(['/job-offers', offer.id]),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors de la sauvegarde');
        this.loading.set(false);
      }
    });
  }
}
