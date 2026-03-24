export interface Interview {
  id: number;
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  interviewerName: string;
  interviewerEmail: string;
  type: string;
  status: string;
  dateTime: string;
  durationMinutes: number;
  location: string;
  videoLink: string;
  invitationToken: string;
  confirmationDate: string;
}
