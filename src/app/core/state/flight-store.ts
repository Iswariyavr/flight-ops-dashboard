import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { FlightApiService } from '../data/flight-api';

@Injectable({ providedIn: 'root' })
export class FlightStore {
  private readonly api = inject(FlightApiService);
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);

  readonly flights$ = this.api.flights$;
  readonly airports$ = this.api.airports$;

  readonly selectedId$ = this.selectedIdSubject.pipe(distinctUntilChanged());

  readonly selectedFlight$ = combineLatest([this.flights$, this.selectedId$]).pipe(
    map(([flights, id]) => flights.find((f) => f.id === id) ?? null),
  );

  select(id: string | null): void {
    this.selectedIdSubject.next(id);
  }
}
