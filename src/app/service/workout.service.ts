import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Workout } from '../models/workout';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
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

  create(payload: {
    workoutName: string;
    description: string | null;
    workoutExercises: {
      exerciseId: number;
      sets: { reps: number; kg: number }[];
    }[];
  }): Observable<Workout> {
    console.log('Payload being sent to backend:', payload); // Debugging log
    return this.http.post<Workout>(this.apiUrl, payload);
  }

  update(id: number, workout: Partial<Workout>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, workout);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
