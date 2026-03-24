import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { Candidate, CandidatePage } from '../../../core/models';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './candidate-list.html',
  styleUrl: './candidate-list.scss'
})
export class CandidateListComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  candidates = signal<Candidate[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  searchKeyword = signal('');
  pageSize = 10;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const keyword = this.searchKeyword() || 'a';
    this.api.get<CandidatePage>('candidates/search', {
      keyword, page: this.currentPage(), size: this.pageSize
    }).subscribe({
      next: (data) => {
        this.candidates.set(data.content);
        this.totalElements.set(data.totalElements);
        this.totalPages.set(data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  search(): void { this.load(); }
  goTo(page: number): void { this.currentPage.set(page); this.load(); }
  pages(): number[] { return Array.from({ length: this.totalPages() }, (_, i) => i); }

  canCreate(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  getInitials(c: Candidate): string {
    return `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase();
  }

  getSkillCount(c: Candidate): number { return c.skills?.length ?? 0; }
  getExpCount(c: Candidate): number { return c.experiences?.length ?? 0; }
}
