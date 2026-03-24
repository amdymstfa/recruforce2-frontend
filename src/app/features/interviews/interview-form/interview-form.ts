import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { JobOfferPage, ApplicationPage } from '../../../core/models';

interface UserOption { id: number; firstName: string; lastName: string; role: string; isActive?: boolean; }

@Component({
  selector: 'app-interview-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './interview-form.html',
  styleUrl: './interview-form.scss'
})
export class InterviewFormComponent implements OnInit {
  private api    = inject(ApiService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  loading      = signal(false);
  error        = signal<string | null>(null);
  applications = signal<any[]>([]);
  allUsers     = signal<UserOption[]>([]);
  selectedType = signal<string>('SOFT_SKILLS');

  form = this.fb.group({
    applicationId:   ['', Validators.required],
    interviewerId:   ['', Validators.required],
    type:            ['SOFT_SKILLS', Validators.required],
    dateTime:        ['', Validators.required],
    durationMinutes: [60, Validators.required],
    location:        ['Remote'],
    videoLink:       [''],
  });

  types = [
    { value: 'SOFT_SKILLS', label: 'Soft Skills', sub: 'Recruteur' },
    { value: 'HARD_SKILLS', label: 'Hard Skills', sub: 'Manager'   },
  ];

  // Filtrage basé sur le signal selectedType — pas sur form.get()
  filteredInterviewers(): UserOption[] {
    const type = this.selectedType();
    if (type === 'SOFT_SKILLS') {
      return this.allUsers().filter(u => u.role === 'RECRUITER');
    }
    return this.allUsers().filter(u => u.role === 'MANAGER');
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value);
    this.form.get('type')?.setValue(value);
    this.form.get('interviewerId')?.setValue('');
  }

  ngOnInit(): void {
    // Charger candidatures qualifiées
    this.api.get<JobOfferPage>('job-offers', { page: 0, size: 50 }).subscribe({
      next: (data) => {
        const offers = data.content.filter(o => o.status === 'ACTIVE');
        if (offers.length === 0) { this.applications.set([]); return; }
        let done = 0;
        const allApps: any[] = [];
        offers.forEach(offer => {
          this.api.get<ApplicationPage>(`applications/job-offer/${offer.id}`, { page: 0, size: 50 }).subscribe({
            next: (apps) => {
              allApps.push(...(apps.content || []).filter((a: any) =>
                a.isQualified && (a.status === 'ACCEPTED' || a.status === 'IN_PROCESS')
              ));
              done++;
              if (done === offers.length) this.applications.set(allApps);
            },
            error: () => { done++; if (done === offers.length) this.applications.set(allApps); }
          });
        });
      }
    });

    // Charger recruteurs et managers
    this.api.get<UserOption[]>('users').subscribe({
      next: (users) => {
        this.allUsers.set(
          (Array.isArray(users) ? users : [])
            .filter((u: any) => u.role === 'MANAGER' || u.role === 'RECRUITER')
            .filter((u: any) => u.isActive !== false)
        );
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.api.post<any>('interviews', this.form.value).subscribe({
      next: (interview) => this.router.navigate(['/interviews', interview.id]),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors de la création');
        this.loading.set(false);
      }
    });
  }
}
