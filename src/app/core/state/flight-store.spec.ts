import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { FlightApi } from '../data/flight-api'; // ← your real class name + path
import { FlightStatus } from '../models/flight.model';
import { AIRPORTS, FLIGHTS } from '../../testing/flight-fixtures';
import { EMPTY_FILTERS } from './flight.selectors';
import { FlightStore } from './flight-store';

/** Reads the latest value of a synchronous stream. */
function latest<T>(source$: Observable<T>): T {
  let value: T | undefined;
  let received = false;
  source$
    .subscribe((v) => {
      value = v;
      received = true;
    })
    .unsubscribe();
  if (!received) throw new Error('Stream emitted no value');
  return value as T;
}

/** Creates the store with a FAKE api, so no real HTTP requests happen. */
function createStore(api: Pick<FlightApi, 'getFlights' | 'getAirports'>): FlightStore {
  TestBed.configureTestingModule({
    providers: [{ provide: FlightApi, useValue: api }],
  });
  return TestBed.inject(FlightStore);
}

const workingApi = {
  getFlights: () => of(FLIGHTS),
  getAirports: () => of(AIRPORTS),
};

describe('FlightStore', () => {
  it('loads flights and reports "ready"', () => {
    const store = createStore(workingApi);

    expect(latest(store.loadStatus$)).toBe('ready');
    expect(latest(store.flights$)).toHaveLength(5);
    expect(latest(store.airports$)).toHaveLength(4);
  });

  it('applies filters to the list and the KPIs together', () => {
    const store = createStore(workingApi);

    store.setFilters({ ...EMPTY_FILTERS, status: FlightStatus.Delayed });

    expect(latest(store.filteredFlights$).map((f) => f.id)).toEqual(['6e-202', 'sg-303']);
    expect(latest(store.kpis$).total).toBe(2);
  });

  it('keeps "needs attention" based on ALL flights, ignoring filters', () => {
    const store = createStore(workingApi);

    store.setFilters({ ...EMPTY_FILTERS, status: FlightStatus.Arrived });

    expect(latest(store.attention$)).toHaveLength(2);
  });

  it('selects a flight by id and returns null for unknown ids', () => {
    const store = createStore(workingApi);

    store.select('sg-303');
    expect(latest(store.selectedFlight$)?.flightNumber).toBe('SG 303');

    store.select('does-not-exist');
    expect(latest(store.selectedFlight$)).toBeNull();
  });

  it('reports "error" when loading fails, and recovers on retry', () => {
    let shouldFail = true;
    const store = createStore({
      getFlights: () => (shouldFail ? throwError(() => new Error('Network down')) : of(FLIGHTS)),
      getAirports: () => of(AIRPORTS),
    });

    expect(latest(store.loadStatus$)).toBe('error');
    expect(latest(store.flights$)).toEqual([]);

    shouldFail = false;
    store.retry();

    expect(latest(store.loadStatus$)).toBe('ready');
    expect(latest(store.flights$)).toHaveLength(5);
  });
});
