export interface CandidateSkill {
  id: number;
  name: string;
  type: string;
  masteryLevel: string;
  yearsExperience: number;
}

export interface Experience {
  id: number;
  position: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  field: string;
  startDate: string;
  endDate: string;
  yearsObtained: number;
}

export interface Language {
  id: number;
  name: string;
  level: string;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  cvPath: string;
  parsedCvId: string;
  experiences: Experience[];
  educations: Education[];
  skills: CandidateSkill[];
  languages: Language[];
  applicationsCount: number;
  createdAt: string;
}

export interface CandidatePage {
  content: Candidate[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
