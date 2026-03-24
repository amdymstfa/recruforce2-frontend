export interface Application {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  jobOfferId: number;
  jobOfferTitle: string;
  receivedAt: string;
  status: string;
  matchingScore: number;
  isQualified: boolean;
  cvFilePath: string;
  coverLetter: string;
  sourceChannel: string;
}

export interface ApplicationPage {
  content: Application[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
