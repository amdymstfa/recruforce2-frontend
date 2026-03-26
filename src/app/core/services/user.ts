import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

export interface CreateUserRequest {
  email:     string;
  password:  string;
  firstName: string;
  lastName:  string;
  phone?:    string;
  role:      'ADMIN' | 'RECRUITER' | 'MANAGER';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api     = inject(ApiService);
  private http    = inject(HttpClient);
  private baseUrl = environment.apiUrl ?? 'http://localhost:8080/api';

  getAll(): Observable<User[]> {
    return this.api.get<User[]>('admin/users');
  }

  getAllForSelect(): Observable<User[]> {
    return this.api.get<User[]>('users');
  }

  getById(id: number): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }

  // createUser(data: CreateUserRequest): Observable<AuthResponse> {
  //   return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data);
  // }

  update(id: number, data: Partial<User>): Observable<User> {
    return this.api.put<User>(`users/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`admin/users/${id}`);
  }
}