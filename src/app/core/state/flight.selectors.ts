import { Flight, FlightFilters, FlightKpis, FlightStatus } from '../models/flight.model';

export const EMPTY_FILTERS: FlightFilters = {
  callsign: '',
  status: null,
  origin: null,
  destination: null,
};

export const EMPTY_KPIS: FlightKpis = {
  total: 0,
  active: 0,
  delayed: 0,
  arrived: 0,
  avgDelayMinutes: 0,
};

/** "IGO 2143" and "igo2143" should match the same flight. */
const normalize = (value: string) => value.replace(/\s+/g, '').toLowerCase();

export function filterFlights(flights: Flight[], filters: FlightFilters): Flight[] {
  const query = normalize(filters.callsign);

  return flights.filter(
    (f) =>
      (!query ||
        normalize(f.callsign).includes(query) ||
        normalize(f.flightNumber).includes(query)) &&
      (!filters.status || f.status === filters.status) &&
      (!filters.origin || f.origin === filters.origin) &&
      (!filters.destination || f.destination === filters.destination),
  );
}

export function computeKpis(flights: Flight[]): FlightKpis {
  const delayed = flights.filter((f) => f.status === FlightStatus.Delayed);
  const totalDelay = delayed.reduce((sum, f) => sum + f.delayMinutes, 0);

  return {
    total: flights.length,
    active: flights.filter((f) => f.airborne).length,
    delayed: delayed.length,
    arrived: flights.filter((f) => f.status === FlightStatus.Arrived).length,
    avgDelayMinutes: delayed.length ? Math.round(totalDelay / delayed.length) : 0,
  };
}

/** Flights running late, worst first. */
export function needsAttention(flights: Flight[]): Flight[] {
  return flights.filter((f) => f.delayMinutes > 0).sort((a, b) => b.delayMinutes - a.delayMinutes);
}

export function countByStatus(flights: Flight[]): Record<FlightStatus, number> {
  const counts = Object.fromEntries(Object.values(FlightStatus).map((s) => [s, 0])) as Record<
    FlightStatus,
    number
  >;
  for (const f of flights) counts[f.status]++;
  return counts;
}
