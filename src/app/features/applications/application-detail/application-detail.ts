import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Application } from '../../../core/models';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss'
})
export class ApplicationDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  application = signal<Application | null>(null);
  loading = signal(true);
  actionMsg = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<Application>(`applications/${id}`).subscribe({
        next: (data) => { this.application.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  changeStatus(status: string): void {
    const id = this.application()?.id;
    if (!id) return;
    this.api.patch<void>(`applications/${id}/status`, null, { params: { status } }).subscribe({
      next: () => {
        this.application.update(a => a ? { ...a, status } : a);
        this.actionMsg.set(`Statut mis à jour : ${this.getStatusLabel(status)}`);
        setTimeout(() => this.actionMsg.set(null), 3000);
      }
    });
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
}
