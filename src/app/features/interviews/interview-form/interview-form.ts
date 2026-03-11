import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-interview-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './interview-form.html',
  styleUrls: ['./interview-form.scss']
})
export class InterviewFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  form: FormGroup;
  saving  = signal(false);
  editMode = signal(false);

  types = ['PHONE', 'VIDEO', 'ON_SITE'];

  constructor() {
    this.form = this.fb.group({
      candidateId:   ['', Validators.required],
      jobOfferId:    [''],
      interviewerId: [''],
      scheduledAt:   ['', Validators.required],
      type:          ['VIDEO', Validators.required],
      location:      [''],
      notes:         [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.api.get<any>(`interviews/${id}`).subscribe({
        next: (d) => this.form.patchValue(d),
        error: () => {}
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const req = this.editMode()
      ? this.api.put(`interviews/${this.route.snapshot.paramMap.get('id')}`, this.form.value)
      : this.api.post('interviews', this.form.value);

    req.subscribe({
      next: () => { this.notify.success('Entretien planifié !'); this.router.navigate(['/interviews']); },
      error: () => { this.notify.error('Erreur.'); this.saving.set(false); }
    });
  }
}
