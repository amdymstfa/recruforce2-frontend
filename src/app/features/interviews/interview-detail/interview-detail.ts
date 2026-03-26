import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { Interview } from '../../../core/models';

@Component({
  selector: 'app-interview-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './interview-detail.html',
  styleUrls: ['./interview-detail.scss']
})
export class InterviewDetailComponent implements OnInit {
  private api         = inject(ApiService);
  private route       = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);

  interview   = signal<Interview | null>(null);
  loading     = signal(true);
  actionMsg   = signal<string | null>(null);
  actionError = signal<string | null>(null);
  activeTab   = signal<'details' | 'feedback'>('details');
  savingFb    = signal(false);

  recommendations: string[] = ['Oui', 'Non', 'Peut-être'];

  feedbackForm = this.fb.group({
    overallScore:   [null as number | null, [Validators.min(0), Validators.max(100)]],
    generalComment: [''],
    recommendation: [''],
    evaluatorId:    [null as number | null],
  });

  evaluationCriteria = signal<{ id: number; name: string; score: number | null; comment: string }[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.api.get<Interview>(`interviews/${id}`).subscribe({
      next: (data) => {
        this.interview.set(data);
        this.loading.set(false);
        const userId = this.authService.currentUser()?.id;
        if (userId) this.feedbackForm.patchValue({ evaluatorId: userId });
        this.loadCriteria(data.type);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadCriteria(interviewType: string): void {
    this.api.get<any[]>('admin/criteria').subscribe({
      next: (criteria) => {
        const filtered = (criteria ?? []).filter(c => c.interviewType === interviewType && c.isActive);
        this.evaluationCriteria.set(filtered.map(c => ({ id: c.id, name: c.name, score: null, comment: '' })));
      },
      error: () => {
        const defaults = interviewType === 'SOFT_SKILLS'
          ? [
              { id: 1, name: 'Communication', score: null, comment: '' },
              { id: 2, name: 'Motivation', score: null, comment: '' },
              { id: 3, name: 'Travail en équipe', score: null, comment: '' },
              { id: 4, name: 'Résolution problèmes', score: null, comment: '' },
              { id: 5, name: 'Adaptabilité', score: null, comment: '' },
            ]
          : [
              { id: 6, name: 'Maîtrise technique', score: null, comment: '' },
              { id: 7, name: 'Qualité du code', score: null, comment: '' },
              { id: 8, name: 'Architecture', score: null, comment: '' },
              { id: 9, name: 'Algorithmique', score: null, comment: '' },
            ];
        this.evaluationCriteria.set(defaults);
      }
    });
  }

  /** ✅ Utilisé par le template pour récupérer la valeur sans `as` */
  getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    return target?.value ?? '';
  }

  updateCriterionScore(id: number, value: string | null | undefined): void {
    const score = value != null ? +value : null;
    this.evaluationCriteria.update(list =>
      list.map(c => c.id === id ? { ...c, score } : c)
    );
  }

  updateCriterionComment(id: number, value: string | null | undefined): void {
    this.evaluationCriteria.update(list =>
      list.map(c => c.id === id ? { ...c, comment: value ?? '' } : c)
    );
  }

  isManager(): boolean   { return this.authService.currentUser()?.role === 'MANAGER'; }
  isRecruiter(): boolean { return this.authService.currentUser()?.role === 'RECRUITER'; }
  isAdmin(): boolean     { return this.authService.currentUser()?.role === 'ADMIN'; }

  canCancel(): boolean {
    return (this.isAdmin() || this.isRecruiter()) &&
      !['CANCELLED', 'COMPLETED'].includes(this.interview()?.status ?? '');
  }

  canSubmitFeedback(): boolean {
    return (this.isManager() || this.isRecruiter() || this.isAdmin()) &&
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
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? 'Erreur lors de l\'annulation');
        setTimeout(() => this.actionError.set(null), 4000);
      }
    });
  }

  saveFeedback(): void {
    const interview = this.interview();
    if (!interview) return;

    const payload = {
      interviewId:   interview.id,
      evaluatorId:   this.feedbackForm.value.evaluatorId ?? this.authService.currentUser()?.id,
      overallScore:  this.feedbackForm.value.overallScore,
      generalComment: this.feedbackForm.value.generalComment,
      recommendation: this.feedbackForm.value.recommendation,
      criteriaEvaluations: this.evaluationCriteria()
        .filter(c => c.score != null)
        .map(c => ({ criterionId: c.id, score: c.score, comment: c.comment }))
    };

    this.savingFb.set(true);
    this.api.post<void>('feedbacks', payload).subscribe({
      next: () => {
        this.actionMsg.set('Feedback enregistré avec succès');
        this.savingFb.set(false);
        setTimeout(() => this.actionMsg.set(null), 3000);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? 'Erreur lors de la sauvegarde');
        this.savingFb.set(false);
        setTimeout(() => this.actionError.set(null), 4000);
      }
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'amber', CONFIRMED: 'jade', COMPLETED: 'gray',
      CANCELLED: 'rose',  RESCHEDULED: 'blue'
    };
    return map[status] ?? 'gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Planifié', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé',
      CANCELLED: 'Annulé',  RESCHEDULED: 'Reprogrammé'
    };
    return map[status] ?? status;
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  }
}
