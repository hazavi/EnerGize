import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class GenericService<Model> {
  private readonly url: string = environment.apiUrl;;

  constructor(private http: HttpClient) {}

  // Get All Model
  getAll(endPoint: string): Observable<Model[]> {
    return this.http.get<Model[]>(this.url + '/' + endPoint); // GET
  }

  // Get Model by ID
  getbyid(endPoint: string, id: string): Observable<Model> {
    return this.http.get<Model>(`${this.url}/${endPoint}/${id}`); // GET{Id}
  }

  // Create Model
  create(endPoint: string, model: Model): Observable<Model> {
    return this.http.post<Model>(`${this.url}/${endPoint}`, model); // POST
  }

  create2<T>(endPoint: string, model: T): Observable<T> {
    return this.http.post<T>(`${this.url}/${endPoint}`, model); // POST
  }
  // Update Model by ID
  updatebyid(endPoint: string, id: number, model: Model): Observable<Model> {
    return this.http.put<Model>(`${this.url}/${endPoint}/${id}`, model); // PUT
  }

  // Delete Model by Id
  deletebyid(endPoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${endPoint}/${id}`); // DELETE
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.url}/users/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.url}/users/login`, data);
  }

}
