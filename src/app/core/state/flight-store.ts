import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { FlightApi } from '../data/flight-api'; // ← your real class name + path
import { Airport, Flight, FlightFilters } from '../models/flight.model';
import { EMPTY_FILTERS, computeKpis, filterFlights, needsAttention } from './flight.selectors';
import { PlaybackService } from '../services/playback';
import { advanceFlights } from './flight-simulation';

export type LoadStatus = 'loading' | 'ready' | 'error';

interface LoadState {
  status: LoadStatus;
  flights: Flight[];
  airports: Airport[];
}

@Injectable({ providedIn: 'root' })
export class FlightStore {
  private readonly api = inject(FlightApi);

  private readonly reload$ = new BehaviorSubject<void>(undefined);
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);
  private readonly filtersSubject = new BehaviorSubject<FlightFilters>(EMPTY_FILTERS);
  private readonly playback = inject(PlaybackService);

  /** Loads both files; every reload$ emission (Retry) starts a fresh request. */
  private readonly state$ = this.reload$.pipe(
    switchMap(() =>
      combineLatest([this.api.getFlights(), this.api.getAirports()]).pipe(
        map(([flights, airports]): LoadState => ({ status: 'ready', flights, airports })),
        startWith<LoadState>({ status: 'loading', flights: [], airports: [] }),
        catchError(() => of<LoadState>({ status: 'error', flights: [], airports: [] })),
      ),
    ),
    shareReplay(1),
  );

  // Raw data
  readonly loadStatus$ = this.state$.pipe(
    map((s) => s.status),
    distinctUntilChanged(),
  );
  /** Loaded flights, moved forward by the playback clock. */
  readonly flights$ = combineLatest([this.state$, this.playback.elapsedMinutes$]).pipe(
    map(([state, minutes]) => advanceFlights(state.flights, state.airports, minutes)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  readonly airports$ = this.state$.pipe(map((s) => s.airports));

  // Filters
  readonly filters$ = this.filtersSubject.asObservable();

  readonly filteredFlights$ = combineLatest([this.flights$, this.filters$]).pipe(
    map(([flights, filters]) => filterFlights(flights, filters)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly kpis$ = this.filteredFlights$.pipe(map(computeKpis));
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

  retry(): void {
    this.reload$.next();
  }
}
