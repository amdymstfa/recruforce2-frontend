export interface Application {
  id: number;
  candidateId?: number;
  candidateName?: string;
  candidateEmail?: string;
  jobOfferId?: number;
  jobTitle?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED';
  matchingScore?: number;
  appliedAt?: string;
  createdAt?: string;
  notes?: string;
}
