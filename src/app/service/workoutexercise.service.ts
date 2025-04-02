import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WorkoutExercise } from '../models/workoutexercise';

@Injectable({
  providedIn: 'root',
})
export class WorkoutExerciseService {
  private readonly apiUrl = `${environment.apiUrl}/workoutExercises`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkoutExercise[]> {
    return this.http.get<WorkoutExercise[]>(this.apiUrl);
  }

  getById(id: number): Observable<WorkoutExercise> {
    return this.http.get<WorkoutExercise>(`${this.apiUrl}/${id}`);
  }

  create(
    workoutExercise: Partial<WorkoutExercise>
  ): Observable<WorkoutExercise> {
    return this.http.post<WorkoutExercise>(this.apiUrl, workoutExercise);
  }

  update(
    id: number,
    workoutExercise: Partial<WorkoutExercise>
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, workoutExercise);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
