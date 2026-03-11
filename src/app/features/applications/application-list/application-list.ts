import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Application } from '../../../core/models';

type StatusFilter = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './application-list.html',
  styleUrls: ['./application-list.scss']
})
export class ApplicationListComponent implements OnInit {
  private api = inject(ApiService);

  applications = signal<Application[]>([]);
  loading = signal(true);
  activeFilter = signal<StatusFilter>('ALL');
  searchQuery = signal('');
  currentPage = signal(0);
  pageSize = 10;
  totalElements = signal(0);

  statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Tout' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'IN_REVIEW', label: 'En cours' },
    { value: 'ACCEPTED', label: 'Accepté' },
    { value: 'REJECTED', label: 'Refusé' },
  ];

  filteredApplications = computed(() => {
    let result = this.applications();
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase();

    if (filter !== 'ALL') {
      result = result.filter(a => a.status === filter);
    }
    if (query) {
      result = result.filter(a =>
        a.candidateName?.toLowerCase().includes(query) ||
        a.jobTitle?.toLowerCase().includes(query)
      );
    }
    return result;
  });

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading.set(true);
    this.api.get<any>(`applications?page=${this.currentPage()}&size=${this.pageSize}&sort=appliedAt,desc`)
      .subscribe({
        next: (data) => {
          const list = data?.content ?? data ?? [];
          this.applications.set(list);
          this.totalElements.set(data?.totalElements ?? list.length);
          this.loading.set(false);
        },
        error: () => {
          // Fallback mock data
          this.applications.set([
            { id: 1, candidateName: 'Marie Dupont', jobTitle: 'Développeur Full-Stack', status: 'PENDING', matchingScore: 87, appliedAt: '2026-03-09' } as any,
            { id: 2, candidateName: 'Ahmed Benali', jobTitle: 'Data Engineer', status: 'ACCEPTED', matchingScore: 92, appliedAt: '2026-03-08' } as any,
            { id: 3, candidateName: 'Lucas Martin', jobTitle: 'UX Designer', status: 'IN_REVIEW', matchingScore: 74, appliedAt: '2026-03-08' } as any,
            { id: 4, candidateName: 'Sofia Ribeiro', jobTitle: 'DevOps Engineer', status: 'REJECTED', matchingScore: 51, appliedAt: '2026-03-07' } as any,
            { id: 5, candidateName: 'Karim Fassi', jobTitle: 'Backend Java', status: 'PENDING', matchingScore: 81, appliedAt: '2026-03-07' } as any,
          ]);
          this.loading.set(false);
        }
      });
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
    this.currentPage.set(0);
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(0);
  }

  nextPage(): void { this.currentPage.update(p => p + 1); this.loadApplications(); }
  prevPage(): void { this.currentPage.update(p => Math.max(0, p - 1)); this.loadApplications(); }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', ACCEPTED: 'Accepté', REJECTED: 'Refusé', IN_REVIEW: 'En cours'
    };
    return map[status] ?? status;
  }

  getScoreColor(score?: number) {

    if (!score) return 'low';

    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';

  }

  trackById(_: number, item: Application): number { return item.id; }
}
