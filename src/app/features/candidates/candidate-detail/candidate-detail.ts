import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { Candidate } from '../../../core/models';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidate-detail.html',
  styleUrl: './candidate-detail.scss'
})
export class CandidateDetailComponent implements OnInit {
  private api         = inject(ApiService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private authService = inject(AuthService);

  candidate   = signal<Candidate | null>(null);
  loading     = signal(true);
  activeTab   = signal<'profile' | 'skills' | 'applications'>('profile');
  showArchive = signal(false);
  archiving   = signal(false);
  actionMsg   = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<Candidate>(`candidates/${id}`).subscribe({
        next: (data) => { this.candidate.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  canArchive(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  archiveCandidate(): void {
    const id = this.candidate()?.id;
    if (!id) return;
    this.archiving.set(true);
    this.api.delete<void>(`candidates/${id}`).subscribe({
      next: () => {
        this.showArchive.set(false);
        this.actionMsg.set('Candidat archivé (RGPD) — données anonymisées');
        setTimeout(() => this.router.navigate(['/candidates']), 2000);
      },
      error: () => {
        this.archiving.set(false);
        this.showArchive.set(false);
        this.actionMsg.set('Erreur lors de l\'archivage');
      }
    });
  }

  getInitials(): string {
    const c = this.candidate();
    return c ? `${c.firstName[0]}${c.lastName[0]}`.toUpperCase() : '??';
  }

  getMasteryColor(level: string): string {
    const map: Record<string, string> = { ADVANCED: 'jade', INTERMEDIATE: 'blue', BEGINNER: 'amber' };
    return map[level] ?? 'gray';
  }

  getMasteryLabel(level: string): string {
    const map: Record<string, string> = { ADVANCED: 'Expert', INTERMEDIATE: 'Intermédiaire', BEGINNER: 'Débutant' };
    return map[level] ?? level;
  }

  getCurrentExp(): any {
    return this.candidate()?.experiences?.find(e => e.isCurrent);
  }
}
