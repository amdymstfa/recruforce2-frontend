import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Interview } from '../../../core/models';

@Component({
  selector: 'app-interview-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './interview-detail.html',
  styleUrls: ['./interview-detail.scss']
})
export class InterviewDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private api    = inject(ApiService);
  private notify = inject(NotificationService);

  interview = signal<Interview | null>(null);
  loading   = signal(true);
  saving    = signal(false);
  feedback  = signal('');
  score     = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(+id);
  }

  load(id: number): void {
    this.api.get<Interview>(`interviews/${id}`).subscribe({
      next: (data) => {
        this.interview.set(data);
        this.feedback.set(data.feedback ?? '');
        this.score.set(data.score ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.interview.set({
          id, candidateId: 1, candidateName: 'Marie Dupont',
          jobTitle: 'Développeur Full-Stack', scheduledAt: '2026-03-12T10:00:00',
          type: 'VIDEO', status: 'SCHEDULED', location: 'Google Meet'
        });
        this.loading.set(false);
      }
    });
  }

  saveFeedback(): void {
    if (!this.interview()) return;
    this.saving.set(true);
    this.api.put(`interviews/${this.interview()!.id}/feedback`, {
      feedback: this.feedback(),
      score: this.score(),
      status: 'COMPLETED'
    }).subscribe({
      next: () => { this.notify.success('Feedback enregistré.'); this.saving.set(false); },
      error: () => { this.notify.error('Erreur.'); this.saving.set(false); }
    });
  }

  cancel(): void {
    if (!this.interview()) return;
    this.api.put(`interviews/${this.interview()!.id}/status`, { status: 'CANCELLED' }).subscribe({
      next: () => { this.notify.success('Entretien annulé.'); this.router.navigate(['/interviews']); },
      error: () => this.notify.error('Erreur.')
    });
  }

  getStatusLabel(s: string): string {
    return ({ SCHEDULED: 'Planifié', COMPLETED: 'Terminé', CANCELLED: 'Annulé', NO_SHOW: 'Absent' })[s] ?? s;
  }
}
