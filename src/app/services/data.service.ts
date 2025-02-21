import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  private getHeaders(): { [key: string]: string } {
    const sessionData = localStorage.getItem('sessionData');
    const token = sessionData ? JSON.parse(sessionData).token : null;
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    headers['x-auth-api-key'] = environment.db_api_key;
  
    return headers;
  }

  getUserData(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/`, { headers: this.getHeaders() });
  }

  getOrdersByEmployeesData(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/orders/employees`, { headers: this.getHeaders() });
  }

  getOrdersData(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/orders/`, { headers: this.getHeaders() });
  }
}
