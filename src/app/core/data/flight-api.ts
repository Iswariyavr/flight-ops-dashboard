import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Airport, Flight } from '../models/flight.model';

@Injectable({ providedIn: 'root' })
export class FlightApi {
  private readonly http = inject(HttpClient);

  getFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>('data/flights.json');
  }

  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>('data/airports.json');
  }
}
