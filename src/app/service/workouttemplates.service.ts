import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WorkoutTemplate } from '../models/workouttemplate';

@Injectable({
  providedIn: 'root',
})
export class WorkoutTemplateService {
  private readonly apiUrl = `${environment.apiUrl}/WorkoutTemplates`;

  constructor(private http: HttpClient) {}

  // ✅ Get all workout templates
  getAll(): Observable<WorkoutTemplate[]> {
    return this.http.get<WorkoutTemplate[]>(this.apiUrl);
  }

  // ✅ Get a single workout template by ID
  getById(id: number): Observable<WorkoutTemplate> {
    return this.http.get<WorkoutTemplate>(`${this.apiUrl}/${id}`);
  }

  // ✅ Create a new workout template
  create(
    workoutTemplate: Partial<WorkoutTemplate>
  ): Observable<WorkoutTemplate> {
    return this.http.post<WorkoutTemplate>(this.apiUrl, workoutTemplate);
  }

  // ✅ Update an existing workout template
  update(
    id: number,
    workoutTemplate: Partial<WorkoutTemplate>
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, workoutTemplate);
  }

  // ✅ Delete a workout template
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
