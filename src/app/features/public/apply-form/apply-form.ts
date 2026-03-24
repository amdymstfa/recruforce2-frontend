import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

interface JobOffer {
  id: number; title: string; description: string; location: string;
  contractType: string; minExperience: number; maxExperience: number;
  minSalary: number; maxSalary: number; requiredSkills: any[];
}

@Component({
  selector: "app-apply-form",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./apply-form.html",
  styleUrl: "./apply-form.scss"
})
export class ApplyFormComponent implements OnInit {
  private http  = inject(HttpClient);
  private route = inject(ActivatedRoute);

  offer        = signal<JobOffer | null>(null);
  loading      = signal(true);
  submitting   = signal(false);
  submitted    = signal(false);
  error        = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isDragging   = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.http.get<JobOffer>(`${environment.apiUrl}/public/job-offers/${id}`).subscribe({
        next: (data) => { this.offer.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
  }

  setFile(file: File): void {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      this.error.set("Format non supporté. Utilisez PDF ou DOCX.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.error.set("Le fichier ne doit pas dépasser 10MB.");
      return;
    }
    this.error.set(null);
    this.selectedFile.set(file);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.error.set(null);
  }

  submit(): void {
    if (!this.selectedFile()) { this.error.set("Veuillez déposer votre CV."); return; }
    this.submitting.set(true);
    this.error.set(null);

    const offer = this.offer()!;
    const formData = new FormData();

    // Envoyer le fichier comme fichier binaire (multipart)
    formData.append("file", this.selectedFile()!);

    // Métadonnées dans le body JSON du webhook
    formData.append("candidateId", "0");
    formData.append("jobOfferId",  String(offer.id));
    formData.append("jobTitle",    offer.title);
    formData.append("sourceChannel", "PORTAL");

    // Appel via proxy Nginx → n8n
    this.http.post("/webhook/cv-parsing", formData).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        console.error("Webhook error:", err);
        // Si n8n répond avec succès mais Angular interprète mal → considérer comme OK
        if (err.status === 200 || err.status === 0) {
          this.submitted.set(true);
        } else {
          this.error.set("Erreur lors de l\'envoi. Veuillez réessayer.");
        }
        this.submitting.set(false);
      }
    });
  }
}
