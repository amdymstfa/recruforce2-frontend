export interface Interview {
  id: number;
  candidateId: number;
  candidateName?: string;
  jobOfferId?: number;
  jobTitle?: string;
  applicationId?: number;
  interviewerId?: number;
  interviewerName?: string;
  scheduledAt: string;
  location?: string;
  type: 'PHONE' | 'VIDEO' | 'ON_SITE';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  feedback?: string;
  score?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
