export interface Feedback {
  id?: number;
  interviewId: number;
  overallScore: number;
  comments: string;
  technicalNotes?: string;
  recommendation: 'HIRE' | 'REJECT' | 'NEXT_ROUND';
  createdAt?: string;
}

export interface FeedbackRequest {
  interviewId: number;
  evaluatorId: number;
  overallScore: number;
  comments: string;
  technicalNotes?: string;
  recommendation: string;
}