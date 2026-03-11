export type UserRole = 'ADMIN' | 'RECRUITER' | 'MANAGER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  active?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}
