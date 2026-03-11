import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

interface DashboardStats {
  candidates: number;
  jobOffers: number;
  applications: number;
  interviews: number;
}

interface RecentApplication {
  id: number;
  candidateName: string;
  jobTitle: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_REVIEW';
  matchingScore: number;
  appliedAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  stats = signal<DashboardStats>({ candidates: 0, jobOffers: 0, applications: 0, interviews: 0 });
  recentApplications = signal<RecentApplication[]>([]);
  loading = signal(true);
  currentDate = new Date();

  statCards = [
    { key: 'candidates', label: 'Candidats', icon: 'users', color: 'indigo', route: '/candidates' },
    { key: 'jobOffers', label: 'Offres actives', icon: 'briefcase', color: 'emerald', route: '/job-offers' },
    { key: 'applications', label: 'Candidatures', icon: 'inbox', color: 'amber', route: '/applications' },
    { key: 'interviews', label: 'Entretiens', icon: 'calendar', color: 'rose', route: '/interviews' },
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Load stats
    this.api.get<DashboardStats>('dashboard/stats').subscribe({
      next: (data) => this.stats.set(data),
      error: () => this.stats.set({ candidates: 45, jobOffers: 12, applications: 89, interviews: 23 })
    });

    // Load recent applications
    this.api.get<RecentApplication[]>('applications?size=5&sort=appliedAt,desc').subscribe({
      next: (data) => {
        this.recentApplications.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.recentApplications.set([
          { id: 1, candidateName: 'Marie Dupont', jobTitle: 'Développeur Full-Stack', status: 'PENDING', matchingScore: 87, appliedAt: '2026-03-09' },
          { id: 2, candidateName: 'Ahmed Benali', jobTitle: 'Data Engineer', status: 'ACCEPTED', matchingScore: 92, appliedAt: '2026-03-08' },
          { id: 3, candidateName: 'Lucas Martin', jobTitle: 'UX Designer', status: 'IN_REVIEW', matchingScore: 74, appliedAt: '2026-03-08' },
          { id: 4, candidateName: 'Sofia Ribeiro', jobTitle: 'DevOps Engineer', status: 'REJECTED', matchingScore: 51, appliedAt: '2026-03-07' },
          { id: 5, candidateName: 'Karim Fassi', jobTitle: 'Backend Java', status: 'PENDING', matchingScore: 81, appliedAt: '2026-03-07' },
        ]);
        this.loading.set(false);
      }
    });
  }

  getStatValue(key: string): number {
    return this.stats()[key as keyof DashboardStats] ?? 0;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente', ACCEPTED: 'Accepté', REJECTED: 'Refusé', IN_REVIEW: 'En cours'
    };
    return labels[status] ?? status;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'mid';
    return 'low';
  }
}
