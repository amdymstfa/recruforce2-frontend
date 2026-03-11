import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Candidate } from '../../../core/models';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidate-profile.html',
  styleUrls: ['./candidate-profile.scss']
})
export class CandidateProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  candidate = signal<Candidate | null>(null);
  loading = signal(true);
  uploading = signal(false);
  activeTab = signal<'profile' | 'applications' | 'cv'>('profile');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadCandidate(+id);
  }

  loadCandidate(id: number): void {
    this.api.get<Candidate>(`candidates/${id}`).subscribe({
      next: (data) => { this.candidate.set(data); this.loading.set(false); },
      error: () => {
        // Mock fallback
        this.candidate.set({
          id, firstName: 'Marie', lastName: 'Dupont',
          email: 'marie.dupont@example.com', phone: '+33 6 12 34 56 78',
          skills: ['Angular', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
          experience: 5, status: 'ACTIVE',
          cvParsed: true, createdAt: '2026-01-15'
        } as any);
        this.loading.set(false);
      }
    });
  }

  onCvUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.candidate()) return;

    const formData = new FormData();
    formData.append('file', file);
    this.uploading.set(true);

    this.api.post(`candidates/${this.candidate()!.id}/cv`, formData).subscribe({
      next: () => {
        this.notify.success('CV uploadé avec succès ! Parsing en cours…');
        this.uploading.set(false);
        this.loadCandidate(this.candidate()!.id);
      },
      error: () => {
        this.notify.error('Erreur lors de l\'upload du CV.');
        this.uploading.set(false);
      }
    });
  }

  goBack(): void { this.router.navigate(['/candidates']); }

  getInitials(): string {
    const c = this.candidate();
    if (!c) return '?';
    return `${c.firstName?.charAt(0) ?? ''}${c.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }
}
