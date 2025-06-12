import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod'
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private usersSubject = new BehaviorSubject<any[]>([]);
  private employeeOrdersSubject = new BehaviorSubject<any[]>([]);
  private ordersSubject = new BehaviorSubject<any[]>([]);

  users$ = this.usersSubject.asObservable();
  employeeOrders$ = this.employeeOrdersSubject.asObservable();
  orders$ = this.ordersSubject.asObservable();
  
  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getHeaders(): { [key: string]: string } {
    const sessionData = localStorage.getItem('sessionData');
    const token = sessionData ? JSON.parse(sessionData).token : null;

    const apiKey = this.configService.getApiKey() || '';
    console.log(apiKey)

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'x-auth-api-key': apiKey
    };

    console.log("Generated Headers:", headers); // Debugging
    return headers;
  }

  fetchUserData(): Observable<any[]> {
    const url = `${environment.apiUrl}/users/`;
    console.log("Fetching Users from:", url); // Debugging

    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      tap(data => {
        console.log("Fetched Users:", data); // Debugging
        if (data && Array.isArray(data)) {
          this.usersSubject.next(data);
        } else {
          console.warn("Unexpected Users API Response:", data);
          this.usersSubject.next([]); // Ensure no null issues
        }
      }),
      catchError(err => {
        console.error("Error Fetching Users:", err);
        return throwError(() => err);
      })
    );
  }

  fetchOrdersByEmployeesData(): Observable<any[]> {
    const url = `${environment.apiUrl}/orders/employees`;
    console.log("Fetching Employee Orders from:", url); // Debugging

    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      tap(data => {
        console.log("Fetched Employee Orders:", data);
        if (data && Array.isArray(data)) {
          this.employeeOrdersSubject.next(data);
        } else {
          console.warn("Unexpected Employee Orders API Response:", data);
          this.employeeOrdersSubject.next([]);
        }
      }),
      catchError(err => {
        console.error("Error Fetching Employee Orders:", err);
        return throwError(() => err);
      })
    );
  }

  fetchOrdersData(): Observable<any[]> {
    const url = `${environment.apiUrl}/orders/`;
    console.log("Fetching Orders from:", url); // Debugging

    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      tap(data => {
        console.log("Fetched Orders:", data); // Debugging
        if (data && Array.isArray(data)) {
          // Convert total_amount to number
          const formattedData = data.map(order => ({
            ...order,
            total_amount: parseFloat(order.total_amount) || 0
          }));
          this.ordersSubject.next(formattedData);
        } else {
          console.warn("Unexpected Orders API Response:", data);
          this.ordersSubject.next([]);
        }
      }),
      catchError(err => {
        console.error("Error Fetching Orders:", err);
        return throwError(() => err);
      })
    );
  }
}
