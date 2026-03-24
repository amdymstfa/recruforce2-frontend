import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
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

  candidate = signal<Candidate | null>(null);
  loading = signal(true);
  uploading = signal(false);
  activeTab = signal<'profile' | 'skills' | 'cv'>('profile');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<Candidate>(`candidates/${id}`).subscribe({
        next: (data) => { this.candidate.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  onCvUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.candidate()) return;
    const formData = new FormData();
    formData.append('file', file);
    this.uploading.set(true);
    this.api.post(`candidates/${this.candidate()!.id}/cv`, formData).subscribe({
      next: () => { this.uploading.set(false); },
      error: () => { this.uploading.set(false); }
    });
  }

  goBack(): void { this.router.navigate(['/candidates']); }

  getInitials(): string {
    const c = this.candidate();
    if (!c) return '?';
    return `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase();
  }
}
