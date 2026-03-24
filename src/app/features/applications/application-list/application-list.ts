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
  private api = inject(ApiService);
  private authService = inject(AuthService);

  applications = signal<Application[]>([]);
  jobOffers = signal<JobOffer[]>([]);
  loading = signal(true);
  selectedJobOffer = signal<number>(1);
  filterStatus = signal('all');
  totalElements = signal(0);
  currentPage = signal(0);
  totalPages = signal(0);
  pageSize = 10;

  statusOptions = [
    { value: 'all',        label: 'Tous'       },
    { value: 'RECEIVED',   label: 'Reçues'     },
    { value: 'IN_PROCESS', label: 'En cours'   },
    { value: 'ACCEPTED',   label: 'Acceptées'  },
    { value: 'REJECTED',   label: 'Refusées'   },
  ];

  ngOnInit(): void {
    this.api.get<JobOfferPage>('job-offers', { page: 0, size: 50 }).subscribe({
      next: (data) => {
        this.jobOffers.set(data.content);
        if (data.content.length > 0) {
          this.selectedJobOffer.set(data.content[0].id);
          this.load();
        }
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.api.get<ApplicationPage>(
      `applications/job-offer/${this.selectedJobOffer()}`,
      { page: this.currentPage(), size: this.pageSize }
    ).subscribe({
      next: (data) => {
        let content = data.content;
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

  changeOffer(id: number): void { this.selectedJobOffer.set(id); this.currentPage.set(0); this.load(); }
  applyFilter(status: string): void { this.filterStatus.set(status); this.currentPage.set(0); this.load(); }
  goTo(page: number): void { this.currentPage.set(page); this.load(); }
  pages(): number[] { return Array.from({ length: this.totalPages() }, (_, i) => i); }

  canChangeStatus(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      RECEIVED: 'gray', IN_PROCESS: 'blue', PENDING: 'amber',
      ACCEPTED: 'jade', REJECTED: 'rose', HIRED: 'purple'
    };
    return map[status] ?? 'gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      RECEIVED: 'Reçue', IN_PROCESS: 'En cours', PENDING: 'En attente',
      ACCEPTED: 'Acceptée', REJECTED: 'Refusée', HIRED: 'Embauché'
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

  changeStatus(id: number, status: string, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    this.api.patch<void>(`applications/${id}/status`, null, { params: { status } }).subscribe({
      next: () => this.load()
    });
  }
}
