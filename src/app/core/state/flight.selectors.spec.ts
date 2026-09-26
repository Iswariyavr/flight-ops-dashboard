import { FlightStatus } from '../models/flight.model';
import { FLIGHTS } from '../../testing/flight-fixtures';
import {
  EMPTY_FILTERS,
  computeKpis,
  countByStatus,
  filterFlights,
  needsAttention,
} from './flight.selectors';

const ids = (list: { id: string }[]) => list.map((f) => f.id);

describe('filterFlights', () => {
  it('returns every flight when no filters are set', () => {
    expect(filterFlights(FLIGHTS, EMPTY_FILTERS)).toHaveLength(5);
  });

  it('matches callsign case-insensitively', () => {
    const result = filterFlights(FLIGHTS, { ...EMPTY_FILTERS, callsign: 'igo' });
    expect(ids(result)).toEqual(['6e-202']);
  });

  it('ignores spaces and also matches flight number', () => {
    const result = filterFlights(FLIGHTS, { ...EMPTY_FILTERS, callsign: '6e 202' });
    expect(ids(result)).toEqual(['6e-202']);
  });

  it('filters by status', () => {
    const result = filterFlights(FLIGHTS, { ...EMPTY_FILTERS, status: FlightStatus.Delayed });
    expect(ids(result)).toEqual(['6e-202', 'sg-303']);
  });

  it('filters by origin and destination together', () => {
    const result = filterFlights(FLIGHTS, {
      ...EMPTY_FILTERS,
      origin: 'DEL',
      destination: 'BLR',
    });
    expect(ids(result)).toEqual(['6e-202']);
  });

  it('returns an empty list when nothing matches', () => {
    const result = filterFlights(FLIGHTS, {
      ...EMPTY_FILTERS,
      origin: 'GOI',
      status: FlightStatus.Arrived,
    });
    expect(result).toEqual([]);
  });
});

describe('computeKpis', () => {
  it('counts total, active (airborne), delayed and arrived', () => {
    expect(computeKpis(FLIGHTS)).toEqual({
      total: 5,
      active: 2,
      delayed: 2,
      arrived: 1,
      avgDelayMinutes: 45,
    });
  });

  it('returns zeros for an empty list', () => {
    expect(computeKpis([])).toEqual({
      total: 0,
      active: 0,
      delayed: 0,
      arrived: 0,
      avgDelayMinutes: 0,
    });
  });
});

describe('needsAttention', () => {
  it('lists only late flights, worst delay first', () => {
    expect(ids(needsAttention(FLIGHTS))).toEqual(['sg-303', '6e-202']);
  });
});

describe('countByStatus', () => {
  it('counts every status, including zero', () => {
    expect(countByStatus(FLIGHTS)).toEqual({
      [FlightStatus.EnRoute]: 1,
      [FlightStatus.Delayed]: 2,
      [FlightStatus.Arrived]: 1,
      [FlightStatus.Boarding]: 0,
      [FlightStatus.Scheduled]: 1,
    });
  });
});
