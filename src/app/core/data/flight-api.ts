import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Airport, Flight } from '../models/flight.model';

@Injectable({ providedIn: 'root' })
export class FlightApiService {
  private http = inject(HttpClient);

  /** Loaded once, then shared by everyone who subscribes. */
  readonly flights$: Observable<Flight[]> = this.http
    .get<Flight[]>('data/flights.json')
    .pipe(shareReplay(1));

  readonly airports$: Observable<Airport[]> = this.http
    .get<Airport[]>('data/airports.json')
    .pipe(shareReplay(1));
}