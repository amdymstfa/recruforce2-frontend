export interface JobOffer {
  id: number;
  title: string;
  department?: string;
  contractType?: string;
  location?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  applicationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
