import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Feedback, FeedbackRequest } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly endpoint = 'feedbacks';

  constructor(private api: ApiService) {}

  submitFeedback(request: FeedbackRequest): Observable<Feedback> {
    return this.api.post<Feedback>(this.endpoint, request);
  }

  getFeedbackByInterview(interviewId: number): Observable<Feedback> {
    return this.api.get<Feedback>(`${this.endpoint}/interview/${interviewId}`);
  }

  getAllFeedbacks(): Observable<Feedback[]> {
    return this.api.get<Feedback[]>(this.endpoint);
  }
}