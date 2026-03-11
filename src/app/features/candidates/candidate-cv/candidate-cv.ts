import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-candidate-cv',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidate-cv.html',
  styleUrls: ['./candidate-cv.scss']
})
export class CandidateCvComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  parsedCv = signal<any>(null);
  loading = signal(true);
  candidateId = signal<number>(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.candidateId.set(+id); this.loadParsedCv(+id); }
  }

  loadParsedCv(id: number): void {
    this.api.get<any>(`candidates/${id}/cv`).subscribe({
      next: (data) => { this.parsedCv.set(data); this.loading.set(false); },
      error: () => {
        this.parsedCv.set({
          name: 'Marie Dupont', email: 'marie.dupont@example.com',
          phone: '+33 6 12 34 56 78', summary: 'Développeuse Full-Stack expérimentée avec 5 ans d\'expérience.',
          skills: ['Angular', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Spring Boot'],
          experiences: [
            { title: 'Développeuse Full-Stack', company: 'Tech Corp', duration: '2022–2026', description: 'Développement d\'applications web Angular/Spring.' },
            { title: 'Développeuse Frontend', company: 'Startup XYZ', duration: '2020–2022', description: 'Création d\'interfaces React.' },
          ],
          education: [{ degree: 'Master Informatique', institution: 'ENSIAS', year: '2020' }],
          languages: ['Français (natif)', 'Anglais (C1)']
        });
        this.loading.set(false);
      }
    });
  }
}
