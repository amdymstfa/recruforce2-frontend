export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills?: string[];
  experience?: number;
  status?: string;
  cvParsed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
