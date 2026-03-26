import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import { Interview } from '../../../core/models';
import { FeedbackRequest } from '../../../core/models/feedback.model';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './feedback-form.html',
  styleUrl: './feedback-form.scss'
})
export class FeedbackFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService); 

  interviewId = signal<number | null>(null);
  interview = signal<Interview | null>(null);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    overallScore: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    recommendation: ['NEXT_ROUND', Validators.required],
    comments: ['', [Validators.required, Validators.minLength(10)]],
    technicalNotes: ['']
  });

  recommendations = [
    { value: 'HIRE', label: 'Recruter', icon: '✅', color: 'jade' },
    { value: 'NEXT_ROUND', label: 'Étape Suivante', icon: '⏭️', color: 'blue' },
    { value: 'REJECT', label: 'Rejeter', icon: '❌', color: 'rose' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.interviewId.set(+id);
      this.loadInterview(+id);
    }
  }

  loadInterview(id: number) {
    this.loading.set(true);
    this.api.get<Interview>(`interviews/${id}`).subscribe({
      next: (data) => {
        this.interview.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Impossible de charger les détails de l'entretien.");
        this.loading.set(false);
      }
    });
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return '';
    return type === 'SOFT_SKILLS' ? 'Entretien RH' : 'Entretien Technique';
  }

  setScore(score: number) {
    this.form.patchValue({ overallScore: score });
  }

  submit() {
    const currentUser = this.auth.currentUser();
    
    if (this.form.invalid || !this.interviewId() || !currentUser) {
      if (!currentUser) {
        this.error.set("Session expirée. Veuillez vous reconnecter.");
      } else {
        this.form.markAllAsTouched();
      }
      return;
    }

    this.submitting.set(true);

    const request: FeedbackRequest = {
      interviewId: this.interviewId()!,
      evaluatorId: currentUser.id, 
      overallScore: this.form.value.overallScore!,
      recommendation: this.form.value.recommendation!,
      comments: this.form.value.comments!,
      technicalNotes: this.form.value.technicalNotes || ''
    };

    this.api.post('feedbacks', request).subscribe({
      next: () => {
        this.router.navigate(['/interviews']);
      },
      error: (err) => {
        this.error.set(err?.error?.message || "Erreur lors de l'enregistrement du feedback.");
        this.submitting.set(false);
      }
    });
  }
}