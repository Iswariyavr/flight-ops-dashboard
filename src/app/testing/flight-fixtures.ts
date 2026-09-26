import { Airport, Flight, FlightStatus } from '../core/models/flight.model';

/** Builds a valid Flight; override only what a test cares about. */
export function makeFlight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: 'ai-101',
    flightNumber: 'AI 101',
    callsign: 'AIC101',
    airline: 'Air India',
    aircraftType: 'A320neo',
    origin: 'DEL',
    destination: 'BOM',
    status: FlightStatus.EnRoute,
    airborne: true,
    estDeparture: '2026-09-24T10:00:00+05:30',
    estArrival: '2026-09-24T12:00:00+05:30',
    delayMinutes: 0,
    position: { lat: 24, lng: 75 },
    heading: 210,
    altitudeFt: 37000,
    groundSpeedKt: 450,
    progress: 0.5,
    ...overrides,
  };
}

/**
 * 5 flights with known answers:
 * total 5 · active 2 · delayed 2 (avg 45 min) · arrived 1
 */
export const FLIGHTS: Flight[] = [
  makeFlight({ id: 'ai-101' }), // DEL → BOM, en route
  makeFlight({
    id: '6e-202',
    flightNumber: '6E 202',
    callsign: 'IGO202',
    origin: 'DEL',
    destination: 'BLR',
    status: FlightStatus.Delayed,
    airborne: false,
    delayMinutes: 30,
  }),
  makeFlight({
    id: 'sg-303',
    flightNumber: 'SG 303',
    callsign: 'SEJ303',
    origin: 'BOM',
    destination: 'GOI',
    status: FlightStatus.Delayed,
    airborne: true,
    delayMinutes: 60,
  }),
  makeFlight({
    id: 'qp-404',
    flightNumber: 'QP 404',
    callsign: 'AKJ404',
    origin: 'BLR',
    destination: 'DEL',
    status: FlightStatus.Arrived,
    airborne: false,
  }),
  makeFlight({
    id: 'ix-505',
    flightNumber: 'IX 505',
    callsign: 'AXB505',
    origin: 'BOM',
    destination: 'DEL',
    status: FlightStatus.Scheduled,
    airborne: false,
  }),
];

export const AIRPORTS: Airport[] = [
  {
    code: 'DEL',
    name: 'Indira Gandhi International',
    city: 'New Delhi',
    position: { lat: 28.5562, lng: 77.1 },
  },
  {
    code: 'BOM',
    name: 'Chhatrapati Shivaji Maharaj International',
    city: 'Mumbai',
    position: { lat: 19.0896, lng: 72.8656 },
  },
  {
    code: 'BLR',
    name: 'Kempegowda International',
    city: 'Bengaluru',
    position: { lat: 13.1986, lng: 77.7066 },
  },
  { code: 'GOI', name: 'Dabolim', city: 'Goa', position: { lat: 15.3808, lng: 73.8314 } },
];
