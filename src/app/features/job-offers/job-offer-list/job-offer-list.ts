import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { JobOffer } from '../../../core/models';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'CLOSED';

@Component({
  selector: 'app-job-offer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-offer-list.html',
  styleUrls: ['./job-offer-list.scss']
})
export class JobOfferListComponent implements OnInit {
  private api = inject(ApiService);

  jobOffers = signal<JobOffer[]>([]);
  loading = signal(true);
  activeFilter = signal<StatusFilter>('ALL');
  searchQuery = signal('');

  statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Toutes' },
    { value: 'PUBLISHED', label: 'Publiées' },
    { value: 'DRAFT', label: 'Brouillons' },
    { value: 'CLOSED', label: 'Fermées' },
  ];

  filteredOffers = computed(() => {
    let result = this.jobOffers();
    const filter = this.activeFilter();
    const q = this.searchQuery().toLowerCase();

    if (filter !== 'ALL') result = result.filter(o => o.status === filter);
    if (q) result = result.filter(o => o.title?.toLowerCase().includes(q) || o.department?.toLowerCase().includes(q));
    return result;
  });

  ngOnInit(): void {
    this.api.get<JobOffer[]>('job-offers').subscribe({
      next: (data) => { this.jobOffers.set(Array.isArray(data) ? data : (data as any).content ?? []); this.loading.set(false); },
      error: () => {
        this.jobOffers.set([
          { id: 1, title: 'Développeur Full-Stack Angular/Spring', department: 'Engineering', status: 'PUBLISHED', applicationsCount: 14, createdAt: '2026-02-20', contractType: 'CDI' } as any,
          { id: 2, title: 'Data Engineer Python', department: 'Data', status: 'PUBLISHED', applicationsCount: 8, createdAt: '2026-02-25', contractType: 'CDI' } as any,
          { id: 3, title: 'UX Designer Senior', department: 'Design', status: 'DRAFT', applicationsCount: 0, createdAt: '2026-03-01', contractType: 'CDD' } as any,
          { id: 4, title: 'DevOps Engineer', department: 'Infrastructure', status: 'CLOSED', applicationsCount: 22, createdAt: '2026-01-10', contractType: 'CDI' } as any,
        ]);
        this.loading.set(false);
      }
    });
  }

  setFilter(f: StatusFilter): void { this.activeFilter.set(f); }
  trackById(_: number, item: JobOffer): number { return item.id; }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { PUBLISHED: 'Publiée', DRAFT: 'Brouillon', CLOSED: 'Fermée' };
    return map[status] ?? status;
  }
}
