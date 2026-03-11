import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-job-offer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './job-offer-form.html',
  styleUrls: ['./job-offer-form.scss']
})
export class JobOfferFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  offerForm: FormGroup;
  loading = signal(false);
  saving = signal(false);
  editMode = signal(false);
  offerId = signal<number | null>(null);

  contractTypes = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];
  departments = ['Engineering', 'Design', 'Data', 'Product', 'Marketing', 'Sales', 'Finance', 'HR', 'Infrastructure'];

  constructor() {
    this.offerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      department: ['', Validators.required],
      contractType: ['CDI', Validators.required],
      location: [''],
      salary: [''],
      description: ['', [Validators.required, Validators.minLength(20)]],
      requirements: [''],
      status: ['DRAFT', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.offerId.set(+id);
      this.loadOffer(+id);
    }
  }

  loadOffer(id: number): void {
    this.loading.set(true);
    this.api.get<any>(`job-offers/${id}`).subscribe({
      next: (data) => { this.offerForm.patchValue(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSubmit(): void {
    if (this.offerForm.invalid) { this.offerForm.markAllAsTouched(); return; }
    this.saving.set(true);

    const request = this.editMode()
      ? this.api.put(`job-offers/${this.offerId()}`, this.offerForm.value)
      : this.api.post('job-offers', this.offerForm.value);

    request.subscribe({
      next: () => {
        this.notify.success(this.editMode() ? 'Offre mise à jour !' : 'Offre créée et publiée sur LinkedIn !');
        this.router.navigate(['/job-offers']);
      },
      error: () => {
        this.notify.error('Erreur lors de la sauvegarde.');
        this.saving.set(false);
      }
    });
  }
}
