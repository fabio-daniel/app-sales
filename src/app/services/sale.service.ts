import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateSaleRequest, CreateSaleResponse, MessageResponse, Sale } from '../models/sale';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private url = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.url);
  }

  create(sale: CreateSaleRequest): Observable<CreateSaleResponse> {
    return this.http.post<CreateSaleResponse>(this.url, sale);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.url}/${id}`);
  }
}
