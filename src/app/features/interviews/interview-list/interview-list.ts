import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { Interview, JobOfferPage, ApplicationPage } from '../../../core/models';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface UserOption { id: number; firstName: string; lastName: string; role: string; isActive?: boolean; }

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './interview-list.html',
  styleUrl: './interview-list.scss'
})
export class InterviewListComponent implements OnInit {
  private api         = inject(ApiService);
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);

  interviews   = signal<Interview[]>([]);
  loading      = signal(true);
  filterStatus = signal('all');

  // Modal
  showModal    = signal(false);
  modalLoading = signal(false);
  modalError   = signal<string | null>(null);
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

  statusOptions = [
    { value: 'all',       label: 'Tous'      },
    { value: 'SCHEDULED', label: 'Planifiés' },
    { value: 'CONFIRMED', label: 'Confirmés' },
    { value: 'COMPLETED', label: 'Terminés'  },
    { value: 'CANCELLED', label: 'Annulés'   },
  ];

  types = [
    { value: 'SOFT_SKILLS', label: 'Soft Skills', sub: 'Recruteur' },
    { value: 'HARD_SKILLS', label: 'Hard Skills', sub: 'Manager'   },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<Interview[]>('interviews').pipe(
      catchError(() => of([] as Interview[]))
    ).subscribe({
      next: (data) => {
        this.interviews.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.showModal.set(true);
    this.modalError.set(null);
    this.form.reset({ type: 'SOFT_SKILLS', durationMinutes: 60, location: 'Remote' });
    this.selectedType.set('SOFT_SKILLS');
    this.loadModalData();
  }

  closeModal(): void { this.showModal.set(false); }

  loadModalData(): void {
    this.api.get<JobOfferPage>('job-offers', { page: 0, size: 50 }).subscribe({
      next: (data) => {
        const offers = data.content.filter((o: any) => o.status === 'ACTIVE');
        if (!offers.length) { this.applications.set([]); return; }
        let done = 0;
        const allApps: any[] = [];
        offers.forEach((offer: any) => {
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

  onTypeChange(value: string): void {
    this.selectedType.set(value);
    this.form.get('type')?.setValue(value);
    this.form.get('interviewerId')?.setValue('');
  }

  filteredInterviewers(): UserOption[] {
    const type = this.selectedType();
    return this.allUsers().filter(u =>
      type === 'SOFT_SKILLS' ? u.role === 'RECRUITER' : u.role === 'MANAGER'
    );
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.modalLoading.set(true);
    this.modalError.set(null);
    this.api.post<any>('interviews', this.form.value).subscribe({
      next: () => {
        this.closeModal();
        this.load();
        this.modalLoading.set(false);
      },
      error: (err) => {
        this.modalError.set(err?.error?.message ?? 'Erreur lors de la création');
        this.modalLoading.set(false);
      }
    });
  }

  canSchedule(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  filtered(): Interview[] {
    if (this.filterStatus() === 'all') return this.interviews();
    return this.interviews().filter(i => i.status === this.filterStatus());
  }

  getStatusColor(s: string): string {
    const m: Record<string,string> = { SCHEDULED:'amber', CONFIRMED:'jade', COMPLETED:'gray', CANCELLED:'rose', RESCHEDULED:'blue' };
    return m[s] ?? 'gray';
  }

  getStatusLabel(s: string): string {
    const m: Record<string,string> = { SCHEDULED:'Planifié', CONFIRMED:'Confirmé', COMPLETED:'Terminé', CANCELLED:'Annulé', RESCHEDULED:'Reprogrammé', WAITING_CANDIDATE:'En attente' };
    return m[s] ?? s;
  }

  getTypeLabel(type: string): string { return type === 'SOFT_SKILLS' ? 'Soft Skills' : 'Hard Skills'; }
  getTypeColor(type: string): string { return type === 'SOFT_SKILLS' ? 'blue' : 'amber'; }
  getInitials(name: string): string { return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) ?? '??'; }
  isUpcoming(dt: string): boolean { return new Date(dt) > new Date(); }
}
