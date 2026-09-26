import { FlightStatus } from '../models/flight.model';
import { AIRPORTS, FLIGHTS, makeFlight } from '../../testing/flight-fixtures';
import { interpolateGreatCircle } from '../utils/geo';
import { advanceFlight, advanceFlights } from './flight-simulation';

const [DEL, BOM] = AIRPORTS; // fixture order: DEL, BOM, BLR, GOI

describe('advanceFlight', () => {
  // makeFlight(): DEL → BOM, 10:00 → 12:00 (120 min), 50% flown, airborne
  const flight = makeFlight();

  it('moves an airborne flight along its great-circle route', () => {
    const moved = advanceFlight(flight, DEL, BOM, 30); // +30 of 120 min = +25%
    const expected = interpolateGreatCircle(DEL.position, BOM.position, 0.75);

    expect(moved.progress).toBeCloseTo(0.75);
    expect(moved.position.lat).toBeCloseTo(expected.lat, 6);
    expect(moved.position.lng).toBeCloseTo(expected.lng, 6);
    expect(moved.status).toBe(FlightStatus.EnRoute);
  });

  it('lands the flight when it reaches the destination', () => {
    const landed = advanceFlight(flight, DEL, BOM, 90);

    expect(landed.status).toBe(FlightStatus.Arrived);
    expect(landed.airborne).toBe(false);
    expect(landed.position).toEqual(BOM.position);
    expect(landed.altitudeFt).toBe(0);
  });

  it('leaves flights on the ground untouched', () => {
    const scheduled = makeFlight({ airborne: false, status: FlightStatus.Scheduled });
    expect(advanceFlight(scheduled, DEL, BOM, 30)).toBe(scheduled);
  });

  it('never modifies the original flight object', () => {
    advanceFlight(flight, DEL, BOM, 30);
    expect(flight.progress).toBe(0.5);
  });
});

describe('advanceFlights', () => {
  it('returns the original list when no time has passed', () => {
    expect(advanceFlights(FLIGHTS, AIRPORTS, 0)).toBe(FLIGHTS);
  });
});
