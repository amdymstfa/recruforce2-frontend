import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';

interface RecentApplication {
  id: number;
  candidateName: string;
  jobOfferTitle: string;
  status: string;
  matchingScore: number;
  receivedAt: string;
  isQualified: boolean;
}

interface Stats {
  candidates:   number;
  jobOffers:    number;
  applications: number;
  interviews:   number;
}

interface MLModel {
  id: number;
  name: string;
  version: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  predictionsCount: number;
  successRate: number;
  isActive: boolean;
}

interface DashboardStats {
  totalCandidates:     number;
  totalJobOffers:      number;
  activeJobOffers:     number;
  totalApplications:   number;
  applicationsToday:   number;
  qualifiedApplications: number;
  totalInterviews:     number;
  upcomingInterviews:  number;
  completedInterviews: number;
  averageMatchingScore: number;
  recentApplications:  RecentApplication[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private api         = inject(ApiService);
  private authService = inject(AuthService);

  user               = this.authService.currentUser;
  stats              = signal<Stats>({ candidates: 0, jobOffers: 0, applications: 0, interviews: 0 });
  recentApplications = signal<RecentApplication[]>([]);
  activeModel        = signal<MLModel | null>(null);
  loading            = signal(true);
  currentDate        = new Date();

  hour     = new Date().getHours();
  greeting = computed(() => {
    if (this.hour < 12) return 'Bonjour';
    if (this.hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  });

  isManager   = computed(() => this.user()?.role === 'MANAGER');
  isRecruiter = computed(() => this.user()?.role === 'RECRUITER');
  isAdmin     = computed(() => this.user()?.role === 'ADMIN');

  statCards = computed(() => {
    const base = [
      { key: 'candidates',   label: 'Candidats',      icon: 'users',     color: 'jade',  route: '/candidates',   trend: '' },
      { key: 'interviews',   label: 'Entretiens',      icon: 'calendar',  color: 'rose',  route: '/interviews',   trend: '' },
    ];
    if (!this.isManager()) {
      base.splice(1, 0,
        { key: 'jobOffers',    label: 'Offres actives',  icon: 'briefcase', color: 'blue',  route: '/job-offers',   trend: '' },
        { key: 'applications', label: 'Candidatures',    icon: 'inbox',     color: 'amber', route: '/applications', trend: '' },
      );
    }
    return base;
  });

  ngOnInit(): void { this.loadDashboardData(); }

  loadDashboardData(): void {
    this.loading.set(true);

    forkJoin({

      dashStats: this.isAdmin()
        ? this.api.get<DashboardStats>('admin/dashboard/stats').pipe(catchError(() => of(null)))
        : of(null),


      candidates: !this.isAdmin()
        ? this.api.get<any>('candidates/search', { keyword: 'a', page: 0, size: 1 })
            .pipe(catchError(() => of({ totalElements: 0 })))
        : of(null),

      jobOffers: !this.isAdmin() && !this.isManager()
        ? this.api.get<any>('job-offers', { page: 0, size: 1 })
            .pipe(catchError(() => of({ totalElements: 0 })))
        : of(null),

      applications: !this.isAdmin() && !this.isManager()
        ? this.api.get<any>('applications', { page: 0, size: 5 })
            .pipe(catchError(() => of({ content: [], totalElements: 0 })))
        : of(null),


      interviews: this.api.get<any[]>('interviews/upcoming')
        .pipe(catchError(() => of([]))),


      mlModel: this.api.get<MLModel>('ml-models/active')
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ dashStats, candidates, jobOffers, applications, interviews, mlModel }) => {

        if (dashStats) {
          // Admin : tout vient du dashboard stats
          this.stats.set({
            candidates:   dashStats.totalCandidates   ?? 0,
            jobOffers:    dashStats.activeJobOffers   ?? 0,
            applications: dashStats.totalApplications ?? 0,
            interviews:   dashStats.upcomingInterviews ?? (Array.isArray(interviews) ? interviews.length : 0),
          });
          this.recentApplications.set(dashStats.recentApplications ?? []);
        } else {
          // Recruiter / Manager : stats séparées
          this.stats.set({
            candidates:   candidates?.totalElements  ?? 0,
            jobOffers:    jobOffers?.totalElements   ?? 0,
            applications: applications?.totalElements ?? 0,
            interviews:   Array.isArray(interviews) ? interviews.length : 0,
          });
          this.recentApplications.set(
            this.isManager() ? [] : (applications?.content ?? [])
          );
        }

        this.activeModel.set(mlModel);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatValue(key: string): number {
    return this.stats()[key as keyof Stats] ?? 0;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      RECEIVED:   'Reçue',
      IN_PROCESS: 'En cours',
      PENDING:    'En attente',
      ACCEPTED:   'Acceptée',
      REJECTED:   'Refusée',
      HIRED:      'Embauché',
    };
    return labels[status] ?? status;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'mid';
    return 'low';
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  }

  getAccuracyPercent():  number { return Math.round((this.activeModel()?.accuracy  ?? 0) * 100); }
  getF1Percent():        number { return Math.round((this.activeModel()?.f1Score   ?? 0) * 100); }
  getPrecisionPercent(): number { return Math.round((this.activeModel()?.precision ?? 0) * 100); }
}
