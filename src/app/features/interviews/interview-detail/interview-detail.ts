import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { Interview } from '../../../core/models';

@Component({
  selector: 'app-interview-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './interview-detail.html',
  styleUrl: './interview-detail.scss'
})
export class InterviewDetailComponent implements OnInit {
  private api         = inject(ApiService);
  private route       = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);

  interview   = signal<Interview | null>(null);
  loading     = signal(true);
  actionMsg   = signal<string | null>(null);
  activeTab   = signal<'details' | 'feedback'>('details');
  savingFb    = signal(false);

  feedbackForm = this.fb.group({
    technicalScore:      [null],
    softSkillsScore:     [null],
    communicationScore:  [null],
    overallScore:        [null],
    strengths:           [''],
    weaknesses:          [''],
    recommendation:      ['NEUTRAL'],
    notes:               [''],
  });

  recommendations = [
    { value: 'STRONGLY_RECOMMENDED', label: '⭐⭐ Fortement recommandé' },
    { value: 'RECOMMENDED',          label: '⭐ Recommandé'             },
    { value: 'NEUTRAL',              label: '➖ Neutre'                  },
    { value: 'NOT_RECOMMENDED',      label: '👎 Non recommandé'          },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<Interview>(`interviews/${id}`).subscribe({
        next: (data) => { this.interview.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  isManager(): boolean {
    return this.authService.currentUser()?.role === 'MANAGER';
  }

  canCancel(): boolean {
    const role = this.authService.currentUser()?.role;
    return (role === 'ADMIN' || role === 'RECRUITER') &&
           this.interview()?.status !== 'CANCELLED' &&
           this.interview()?.status !== 'COMPLETED';
  }

  canSubmitFeedback(): boolean {
    const role = this.authService.currentUser()?.role;
    return (role === 'MANAGER' || role === 'RECRUITER' || role === 'ADMIN') &&
           this.interview()?.status === 'COMPLETED';
  }

  cancel(): void {
    const id = this.interview()?.id;
    if (!id) return;
    this.api.post<void>(`interviews/${id}/cancel`, {}).subscribe({
      next: () => {
        this.interview.update(i => i ? { ...i, status: 'CANCELLED' } : i);
        this.actionMsg.set('Entretien annulé');
        setTimeout(() => this.actionMsg.set(null), 3000);
      }
    });
  }

  saveFeedback(): void {
    const id = this.interview()?.id;
    if (!id) return;
    this.savingFb.set(true);
    this.api.post<void>(`interviews/${id}/feedback`, this.feedbackForm.value).subscribe({
      next: () => {
        this.actionMsg.set('Feedback enregistré avec succès');
        this.savingFb.set(false);
        setTimeout(() => this.actionMsg.set(null), 3000);
      },
      error: (err) => {
        this.actionMsg.set(err?.error?.message ?? 'Erreur lors de la sauvegarde');
        this.savingFb.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'amber', CONFIRMED: 'jade', COMPLETED: 'gray',
      CANCELLED: 'rose', RESCHEDULED: 'blue'
    };
    return map[status] ?? 'gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Planifié', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé',
      CANCELLED: 'Annulé', RESCHEDULED: 'Reprogrammé'
    };
    return map[status] ?? status;
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  }
}
