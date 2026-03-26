import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  private router      = inject(Router);

  interviews   = signal<Interview[]>([]);
  loading      = signal(true);
  filterStatus = signal('all');

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
    this.api.get<Interview[]>('interviews/upcoming').pipe(
      catchError(() => of([] as Interview[]))
    ).subscribe({
      next: (data) => {
        this.interviews.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // --- LOGIQUE FEEDBACK ---
  canGiveFeedback(interview: Interview): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;

    const isInterviewer = interview.id === user.id;
    const isAdmin = user.role === 'ADMIN';
    const isPast = new Date(interview.dateTime) < new Date();

    return (isInterviewer || isAdmin) && (isPast || interview.status === 'COMPLETED');
  }

  openFeedbackForm(id: number): void {
    this.router.navigate(['/interviews', id, 'feedback', 'new']);
  }

  viewFeedback(id: number): void {
    this.router.navigate(['/interviews', id, 'feedback']);
  }

  // --- LOGIQUE MODAL ---
  openModal(): void {
    this.showModal.set(true);
    this.modalError.set(null);
    this.form.reset({ type: 'SOFT_SKILLS', durationMinutes: 60, location: 'Remote' });
    this.loadModalData();
  }

  closeModal(): void { this.showModal.set(false); }

  loadModalData(): void {
    this.api.get<JobOfferPage>('job-offers', { page: 0, size: 50 }).subscribe(data => {
      const activeOffers = data.content.filter((o: any) => o.status === 'ACTIVE');
      let done = 0; const results: any[] = [];
      if (!activeOffers.length) return;
      activeOffers.forEach(o => {
        this.api.get<ApplicationPage>(`applications/job-offer/${o.id}`).subscribe(apps => {
          results.push(...(apps.content || []).filter((a: any) => a.isQualified));
          done++; if (done === activeOffers.length) this.applications.set(results);
        });
      });
    });

    this.api.get<UserOption[]>('users').subscribe(users => {
      this.allUsers.set(Array.isArray(users) ? users : []);
    });
  }

  onTypeChange(v: string): void {
    this.selectedType.set(v);
    this.form.get('type')?.setValue(v);
  }

  filteredInterviewers(): UserOption[] {
    return this.allUsers().filter(u => this.selectedType() === 'SOFT_SKILLS' ? u.role === 'RECRUITER' : u.role === 'MANAGER');
  }

  submit(): void {
    if (this.form.invalid) return;
    this.modalLoading.set(true);
    this.api.post('interviews', this.form.value).subscribe({
      next: () => { this.closeModal(); this.load(); this.modalLoading.set(false); },
      error: (e) => { this.modalError.set(e?.error?.message || 'Erreur'); this.modalLoading.set(false); }
    });
  }

  canSchedule(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  filtered(): Interview[] {
    return this.filterStatus() === 'all' ? this.interviews() : this.interviews().filter(i => i.status === this.filterStatus());
  }

  getStatusColor(s: string): string {
    const m: any = { SCHEDULED:'amber', CONFIRMED:'jade', COMPLETED:'gray', CANCELLED:'rose' };
    return m[s] || 'gray';
  }

  getStatusLabel(s: string): string {
    const m: any = { SCHEDULED:'Planifié', CONFIRMED:'Confirmé', COMPLETED:'Terminé', CANCELLED:'Annulé' };
    return m[s] || s;
  }

  getTypeLabel(t: string): string { return t === 'SOFT_SKILLS' ? 'Soft Skills' : 'Hard Skills'; }
  getTypeColor(t: string): string { return t === 'SOFT_SKILLS' ? 'blue' : 'amber'; }
  getInitials(n: string): string { return n?.split(' ').map(x => x[0]).join('').toUpperCase() || '??'; }
  isUpcoming(d: string): boolean { return new Date(d) > new Date(); }
}