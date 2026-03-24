import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './candidate-form.html',
  styleUrl: './candidate-form.scss'
})
export class CandidateFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName:  ['', [Validators.required]],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    address:   [''],
  });

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.api.post<any>('candidates', this.form.value).subscribe({
      next: (candidate) => {
        if (this.selectedFile() && candidate.id) {
          const formData = new FormData();
          formData.append('file', this.selectedFile()!);
          this.api.post<any>(`candidates/${candidate.id}/cv`, formData).subscribe({
            next: () => this.router.navigate(['/candidates', candidate.id]),
            error: () => this.router.navigate(['/candidates', candidate.id])
          });
        } else {
          this.router.navigate(['/candidates', candidate.id]);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors de la création');
        this.loading.set(false);
      }
    });
  }
}
