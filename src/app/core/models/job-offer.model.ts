export interface SkillRef {
  id: number;
  name: string;
  type: string;
  requiredLevel: string;
}

export interface JobOffer {
  id: number;
  title: string;
  description: string;
  location: string;
  contractType: string;
  status: string;
  minExperience: number;
  maxExperience: number;
  minSalary: number;
  maxSalary: number;
  publicationDate: string;
  expirationDate: string;
  createdById: number;
  createdByName: string;
  requiredSkills: SkillRef[];
  publishedOnLinkedin: boolean;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferPage {
  content: JobOffer[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
