import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Interview } from '../../../core/models';

type StatusFilter = 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './interview-list.html',
  styleUrls: ['./interview-list.scss']
})
export class InterviewListComponent implements OnInit {
  private api = inject(ApiService);

  interviews = signal<Interview[]>([]);
  loading = signal(true);
  activeFilter = signal<StatusFilter>('ALL');
  searchQuery = signal('');

  statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'ALL',       label: 'Tous' },
    { value: 'SCHEDULED', label: 'Planifié' },
    { value: 'COMPLETED', label: 'Terminé' },
    { value: 'CANCELLED', label: 'Annulé' },
    { value: 'NO_SHOW',   label: 'Absent' },
  ];

  filteredInterviews = computed(() => {
    let result = this.interviews();
    const f = this.activeFilter();
    const q = this.searchQuery().toLowerCase();
    if (f !== 'ALL') result = result.filter(i => i.status === f);
    if (q) result = result.filter(i =>
      i.candidateName?.toLowerCase().includes(q) ||
      i.jobTitle?.toLowerCase().includes(q)
    );
    return result;
  });

  ngOnInit(): void { this.loadInterviews(); }

  loadInterviews(): void {
    this.loading.set(true);
    this.api.get<Interview[]>('interviews').subscribe({
      next: (data) => { this.interviews.set(Array.isArray(data) ? data : []); this.loading.set(false); },
      error: () => {
        this.interviews.set([
          { id: 1, candidateId: 1, candidateName: 'Marie Dupont',   jobTitle: 'Développeur Full-Stack', scheduledAt: '2026-03-12T10:00:00', type: 'VIDEO',    status: 'SCHEDULED' },
          { id: 2, candidateId: 2, candidateName: 'Ahmed Benali',   jobTitle: 'Data Engineer',          scheduledAt: '2026-03-11T14:00:00', type: 'ON_SITE',  status: 'COMPLETED' },
          { id: 3, candidateId: 3, candidateName: 'Lucas Martin',   jobTitle: 'UX Designer',            scheduledAt: '2026-03-10T09:00:00', type: 'PHONE',    status: 'CANCELLED' },
        ]);
        this.loading.set(false);
      }
    });
  }

  setFilter(f: StatusFilter): void { this.activeFilter.set(f); }

  getStatusLabel(s: string): string {
    return ({ SCHEDULED: 'Planifié', COMPLETED: 'Terminé', CANCELLED: 'Annulé', NO_SHOW: 'Absent' })[s] ?? s;
  }

  getTypeLabel(t: string): string {
    return ({ PHONE: 'Téléphone', VIDEO: 'Vidéo', ON_SITE: 'Présentiel' })[t] ?? t;
  }

  trackById(_: number, item: Interview): number { return item.id; }
}
