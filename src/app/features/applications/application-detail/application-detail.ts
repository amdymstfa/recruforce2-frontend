import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './application-detail.html',
  styleUrls: ['./application-detail.scss']
})
export class ApplicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  application = signal<any>(null);
  loading = signal(true);
  updating = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadApplication(+id);
  }

  loadApplication(id: number): void {
    this.api.get<any>(`applications/${id}`).subscribe({
      next: (data) => { this.application.set(data); this.loading.set(false); },
      error: () => {
        this.application.set({
          id, candidateName: 'Marie Dupont', jobTitle: 'Développeur Full-Stack',
          status: 'PENDING', matchingScore: 87, appliedAt: '2026-03-09',
          candidateEmail: 'marie.dupont@example.com',
          skills: ['Angular', 'TypeScript', 'Spring Boot'],
          aiRecommendation: 'Candidat fortement recommandé. Compétences techniques solides.',
        });
        this.loading.set(false);
      }
    });
  }

  updateStatus(status: string): void {
    if (!this.application()) return;
    this.updating.set(true);
    this.api.put(`applications/${this.application().id}/status`, { status }).subscribe({
      next: () => {
        this.application.update(a => ({ ...a, status }));
        this.notify.success('Statut mis à jour');
        this.updating.set(false);
      },
      error: () => { this.notify.error('Erreur mise à jour'); this.updating.set(false); }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'high'; if (score >= 60) return 'mid'; return 'low';
  }
  getStatusLabel(s: string): string {
    return ({ PENDING: 'En attente', ACCEPTED: 'Accepté', REJECTED: 'Refusé', IN_REVIEW: 'En cours' })[s] ?? s;
  }
}
