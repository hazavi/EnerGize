import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class GenericService<Model> {
  private readonly url: string = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ✅ Create function to get auth headers
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // ✅ Include headers in all API calls
  getAll(endPoint: string): Observable<Model[]> {
    return this.http.get<Model[]>(`${this.url}/${endPoint}`, {
      headers: this.getHeaders(),
    });
  }

  getbyid(endPoint: string, id: string): Observable<Model> {
    return this.http.get<Model>(`${this.url}/${endPoint}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  create(endPoint: string, model: Model): Observable<Model> {
    return this.http.post<Model>(`${this.url}/${endPoint}`, model, {
      headers: this.getHeaders(),
    });
  }

  create2<T>(endPoint: string, model: T): Observable<T> {
    return this.http.post<T>(`${this.url}/${endPoint}`, model, {
      headers: this.getHeaders(),
    });
  }

  updatebyid(endPoint: string, id: number, model: Model): Observable<Model> {
    return this.http.put<Model>(`${this.url}/${endPoint}/${id}`, model, {
      headers: this.getHeaders(),
    });
  }

  deletebyid(endPoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${endPoint}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.url}/users/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.url}/users/login`, data);
  }

  createWithFile(endPoint: string, formData: FormData): Observable<any> {
    // Use the 'multipart/form-data' content type for file uploads
    const headers = new HttpHeaders({
      Authorization: this.getHeaders().get('Authorization') ?? '',
    });
    return this.http.post(`${this.url}/${endPoint}`, formData, { headers });
  }
}
