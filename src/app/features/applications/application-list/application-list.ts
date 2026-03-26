import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { Application, ApplicationPage, JobOffer, JobOfferPage } from '../../../core/models';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './application-list.html',
  styleUrl: './application-list.scss'
})
export class ApplicationListComponent implements OnInit {
  private api         = inject(ApiService);
  private authService = inject(AuthService);

  applications  = signal<Application[]>([]);
  jobOffers     = signal<JobOffer[]>([]);
  loading       = signal(true);
  totalElements = signal(0);
  currentPage   = signal(0);
  totalPages    = signal(0);
  pageSize      = 10;

  // FIX: mode de vue — 'all' affiche toutes les candidatures, 'by-offer' filtre par offre
  viewMode         = signal<'all' | 'by-offer'>('all');
  selectedJobOffer = signal<number | null>(null);
  filterStatus     = signal('all');

  statusOptions = [
    { value: 'all',        label: 'Tous'       },
    { value: 'RECEIVED',   label: 'Reçues'     },
    { value: 'IN_PROCESS', label: 'En cours'   },
    { value: 'ACCEPTED',   label: 'Acceptées'  },
    { value: 'REJECTED',   label: 'Refusées'   },
  ];

  ngOnInit(): void {
    // Charger les offres pour le filtre (optionnel)
    this.api.get<JobOfferPage>('job-offers', { page: 0, size: 50 }).subscribe({
      next: (data) => this.jobOffers.set(data.content ?? []),
      error: () => {}
    });
    // Charger toutes les candidatures par défaut
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const params: Record<string, any> = {
      page: this.currentPage(),
      size: this.pageSize,
    };

    // FIX: GET /api/applications (global) ou GET /api/applications/job-offer/{id}
    const endpoint = this.viewMode() === 'by-offer' && this.selectedJobOffer()
      ? `applications/job-offer/${this.selectedJobOffer()}`
      : 'applications';

    this.api.get<ApplicationPage>(endpoint, params).subscribe({
      next: (data) => {
        let content = data.content ?? [];

        // Filtre statut côté client (le backend ne filtre que par offre)
        if (this.filterStatus() !== 'all') {
          content = content.filter(a => a.status === this.filterStatus());
        }

        this.applications.set(content);
        this.totalElements.set(data.totalElements);
        this.totalPages.set(data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setViewMode(mode: 'all' | 'by-offer'): void {
    this.viewMode.set(mode);
    this.currentPage.set(0);
    if (mode === 'all') this.selectedJobOffer.set(null);
    this.load();
  }

  changeOffer(id: number): void {
    this.selectedJobOffer.set(id);
    this.viewMode.set('by-offer');
    this.currentPage.set(0);
    this.load();
  }

  applyFilter(status: string): void {
    this.filterStatus.set(status);
    this.currentPage.set(0);
    this.load();
  }

  goTo(page: number): void { this.currentPage.set(page); this.load(); }
  pages(): number[] { return Array.from({ length: this.totalPages() }, (_, i) => i); }

  canChangeStatus(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  // FIX: appelle PATCH /api/applications/{id}/status (endpoint créé côté backend)
  changeStatus(id: number, status: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.api.patch<void>(`applications/${id}/status`, null, { params: { status } }).subscribe({
      next: () => this.load()
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      RECEIVED: 'gray', IN_PROCESS: 'blue', PENDING: 'amber',
      ACCEPTED: 'jade', REJECTED: 'rose',   HIRED: 'purple'
    };
    return map[status] ?? 'gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      RECEIVED:   'Reçue',      IN_PROCESS: 'En cours',
      PENDING:    'En attente', ACCEPTED:   'Acceptée',
      REJECTED:   'Refusée',   HIRED:      'Embauché'
    };
    return map[status] ?? status;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'jade';
    if (score >= 60) return 'amber';
    return 'rose';
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  }
}
