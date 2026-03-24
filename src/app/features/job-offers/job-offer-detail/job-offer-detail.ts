import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { JobOffer } from '../../../core/models';

@Component({
  selector: 'app-job-offer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-offer-detail.html',
  styleUrl: './job-offer-detail.scss'
})
export class JobOfferDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  offer = signal<JobOffer | null>(null);
  loading = signal(true);
  actionMsg = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<JobOffer>(`job-offers/${id}`).subscribe({
        next: (data) => { this.offer.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  canModify(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  }

  publish(): void {
    const id = this.offer()?.id;
    if (!id) return;
    this.api.post<void>(`job-offers/${id}/publish`, {}).subscribe({
      next: () => {
        this.offer.update(o => o ? { ...o, status: 'ACTIVE' } : o);
        this.actionMsg.set('Offre publiée avec succès');
        setTimeout(() => this.actionMsg.set(null), 3000);
      }
    });
  }

  archive(): void {
    const id = this.offer()?.id;
    if (!id) return;
    this.api.post<void>(`job-offers/${id}/archive`, {}).subscribe({
      next: () => {
        this.offer.update(o => o ? { ...o, status: 'ARCHIVED' } : o);
        this.actionMsg.set('Offre archivée');
        setTimeout(() => this.actionMsg.set(null), 3000);
      }
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = { ACTIVE: 'jade', DRAFT: 'amber', ARCHIVED: 'gray' };
    return map[status] ?? 'gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { ACTIVE: 'Active', DRAFT: 'Brouillon', ARCHIVED: 'Archivée' };
    return map[status] ?? status;
  }
}
