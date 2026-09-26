import { Airport, Flight, FlightStatus } from '../models/flight.model';
import { bearing, interpolateGreatCircle } from '../utils/geo';

/** Moves every airborne flight forward by `minutes` of simulated time. */
export function advanceFlights(flights: Flight[], airports: Airport[], minutes: number): Flight[] {
  if (minutes <= 0) return flights;

  const byCode = new Map(airports.map((a) => [a.code, a]));
  return flights.map((f) =>
    advanceFlight(f, byCode.get(f.origin), byCode.get(f.destination), minutes),
  );
}

export function advanceFlight(
  flight: Flight,
  origin: Airport | undefined,
  destination: Airport | undefined,
  minutes: number,
): Flight {
  // Only planes in the air move; ground flights stay as they are
  if (!flight.airborne || !origin || !destination) return flight;

  const durationMinutes =
    (Date.parse(flight.estArrival) - Date.parse(flight.estDeparture)) / 60_000;
  if (durationMinutes <= 0) return flight;

  const progress = Math.min(1, flight.progress + minutes / durationMinutes);

  // Touchdown
  if (progress >= 1) {
    return {
      ...flight,
      progress: 1,
      airborne: false,
      status: FlightStatus.Arrived,
      position: { ...destination.position },
      altitudeFt: 0,
      groundSpeedKt: 0,
    };
  }

  const position = interpolateGreatCircle(origin.position, destination.position, progress);
  return {
    ...flight,
    progress,
    position,
    heading: bearing(position, destination.position),
  };
}
