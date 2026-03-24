import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface JobOffer {
  id: number; title: string; description: string; location: string;
  contractType: string; minExperience: number; maxExperience: number;
  minSalary: number; maxSalary: number; publicationDate: string;
  expirationDate: string; requiredSkills: any[];
}

interface Page { content: JobOffer[]; totalElements: number; totalPages: number; number: number; }

@Component({
  selector: 'app-apply-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './apply-list.html',
  styleUrl: './apply-list.scss'
})
export class ApplyListComponent implements OnInit {
  private http = inject(HttpClient);

  offers        = signal<JobOffer[]>([]);
  loading       = signal(true);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);
  searchKeyword = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.http.get<Page>(`${environment.apiUrl}/public/job-offers`, {
      params: { page: this.currentPage(), size: 12 }
    }).subscribe({
      next: (data) => {
        let offers = data.content;
        if (this.searchKeyword().trim()) {
          const kw = this.searchKeyword().toLowerCase();
          offers = offers.filter(o =>
            o.title.toLowerCase().includes(kw) ||
            o.location.toLowerCase().includes(kw) ||
            o.contractType.toLowerCase().includes(kw)
          );
        }
        this.offers.set(offers);
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
}
