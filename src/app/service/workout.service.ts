import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Workout } from '../models/workout';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private readonly apiUrl = `${environment.apiUrl}/workouts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.apiUrl);
  }

  getById(id: number): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/${id}`);
  }

  create(workout: Partial<Workout>): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }

  update(id: number, workout: Partial<Workout>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, workout);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
