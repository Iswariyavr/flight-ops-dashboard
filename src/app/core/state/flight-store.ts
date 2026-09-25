import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { FlightApiService } from '../data/flight-api'; // ← your real class name + path
import { FlightFilters } from '../models/flight.model';
import { EMPTY_FILTERS, computeKpis, filterFlights, needsAttention } from './flight.selectors';

@Injectable({ providedIn: 'root' })
export class FlightStore {
  private readonly api = inject(FlightApiService);

  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);
  private readonly filtersSubject = new BehaviorSubject<FlightFilters>(EMPTY_FILTERS);

  // Raw data
  readonly flights$ = this.api.flights$;
  readonly airports$ = this.api.airports$;

  // Filters
  readonly filters$ = this.filtersSubject.asObservable();

  readonly filteredFlights$ = combineLatest([this.flights$, this.filters$]).pipe(
    map(([flights, filters]) => filterFlights(flights, filters)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly kpis$ = this.filteredFlights$.pipe(map(computeKpis));

  /** Uses ALL flights: delays stay visible even when filters hide them. */
  readonly attention$ = this.flights$.pipe(map(needsAttention));

  // Selection
  readonly selectedId$ = this.selectedIdSubject.pipe(distinctUntilChanged());

  readonly selectedFlight$ = combineLatest([this.flights$, this.selectedId$]).pipe(
    map(([flights, id]) => flights.find((f) => f.id === id) ?? null),
  );

  setFilters(filters: FlightFilters): void {
    this.filtersSubject.next(filters);
  }

  select(id: string | null): void {
    this.selectedIdSubject.next(id);
  }
}
