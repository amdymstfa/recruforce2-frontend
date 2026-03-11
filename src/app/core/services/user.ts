import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getAll(): Observable<User[]> {
    return this.api.get<User[]>('users');
  }

  getById(id: number): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }

  update(id: number, data: Partial<User>): Observable<User> {
    return this.api.put<User>(`users/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`users/${id}`);
  }
}
