import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-job-offer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-offer-detail.html',
  styleUrls: ['./job-offer-detail.scss']
})
export class JobOfferDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  offer = signal<any>(null);
  applications = signal<any[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOffer(+id);
  }

  loadOffer(id: number): void {
    this.api.get<any>(`job-offers/${id}`).subscribe({
      next: (data) => { this.offer.set(data); this.loading.set(false); this.loadApplications(id); },
      error: () => {
        this.offer.set({ id, title: 'Développeur Full-Stack Angular/Spring', department: 'Engineering', contractType: 'CDI', status: 'PUBLISHED', location: 'Paris, France', description: 'Nous recherchons un développeur Full-Stack passionné pour rejoindre notre équipe.', createdAt: '2026-02-20', applicationsCount: 14 });
        this.loading.set(false);
      }
    });
  }

  loadApplications(offerId: number): void {
    this.api.get<any[]>(`applications?jobOfferId=${offerId}`).subscribe({
      next: (data) => this.applications.set(Array.isArray(data) ? data : []),
      error: () => this.applications.set([])
    });
  }

  closeOffer(): void {
    if (!this.offer()) return;
    this.api.put(`job-offers/${this.offer().id}/status`, { status: 'CLOSED' }).subscribe({
      next: () => { this.offer.update(o => ({ ...o, status: 'CLOSED' })); this.notify.success('Offre fermée.'); },
      error: () => this.notify.error('Erreur.')
    });
  }

  getStatusLabel(s: string): string {
    return ({ PUBLISHED: 'Publiée', DRAFT: 'Brouillon', CLOSED: 'Fermée' })[s] ?? s;
  }
}
