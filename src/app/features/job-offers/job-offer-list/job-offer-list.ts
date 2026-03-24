import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { JobOffer, JobOfferPage } from '../../../core/models';

@Component({
  selector: 'app-job-offer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-offer-list.html',
  styleUrl: './job-offer-list.scss'
})
export class JobOfferListComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  allOffers = signal<JobOffer[]>([]);
  offers = signal<JobOffer[]>([]);
  loading = signal(true);
  filterStatus = signal('all');
  searchKeyword = signal('');

  statusOptions = [
    { value: 'all',      label: 'Toutes'     },
    { value: 'ACTIVE',   label: 'Actives'    },
    { value: 'DRAFT',    label: 'Brouillons' },
    { value: 'ARCHIVED', label: 'Archivées'  },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<JobOfferPage>('job-offers', { page: 0, size: 100 }).subscribe({
      next: (data) => {
        this.allOffers.set(data.content || []);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(value: string): void {
    this.searchKeyword.set(value);
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.allOffers();
    
    // Filtre par statut
    if (this.filterStatus() !== 'all') {
      result = result.filter(o => o.status === this.filterStatus());
    }
    
    // Filtre par mot-clé
    const kw = this.searchKeyword().trim().toLowerCase();
    if (kw) {
      result = result.filter(o =>
        o.title.toLowerCase().includes(kw) ||
        o.location.toLowerCase().includes(kw) ||
        o.contractType.toLowerCase().includes(kw)
      );
    }
    
    this.offers.set(result);
  }

  applyFilter(status: string): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  canCreate(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  canModify(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = { ACTIVE: 'jade', DRAFT: 'amber', ARCHIVED: 'gray' };
    return map[status] ?? 'gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { ACTIVE: 'Active', DRAFT: 'Brouillon', ARCHIVED: 'Archivée' };
    return map[status] ?? status;
  }

  publish(id: number, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    this.api.post<void>(`job-offers/${id}/publish`, {}).subscribe({ next: () => this.load() });
  }

  archive(id: number, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    this.api.post<void>(`job-offers/${id}/archive`, {}).subscribe({ next: () => this.load() });
  }
}
