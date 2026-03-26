export interface Interview {
  id: number;
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  type: 'SOFT_SKILLS' | 'HARD_SKILLS';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'WAITING_CANDIDATE';
  dateTime: string;
  durationMinutes: number;
  location?: string;
  videoLink?: string;
  interviewerId: number;
  interviewerName: string;
  interviewerEmail?: string;
  hasFeedback: boolean; 
  invitationToken?: string;
  confirmationDate?: string;
}

export interface InterviewPage {
  content: Interview[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}