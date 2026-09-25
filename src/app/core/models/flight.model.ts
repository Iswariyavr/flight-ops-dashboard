export enum FlightStatus {
  Scheduled = 'SCHEDULED',
  Boarding = 'BOARDING',
  EnRoute = 'EN_ROUTE',
  Delayed = 'DELAYED',
  Arrived = 'ARRIVED',
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Airport {
  code: string; // IATA code, e.g. "BLR"
  name: string;
  city: string;
  position: LatLng;
}

export interface Flight {
  id: string; // "ai-889"
  flightNumber: string; // "AI 889"
  callsign: string; // "AIC889"
  airline: string;
  aircraftType: string; // "A320neo"
  origin: string; // airport code
  destination: string; // airport code
  status: FlightStatus;
  airborne: boolean;
  estDeparture: string; // ISO 8601 with +05:30 offset
  estArrival: string;
  delayMinutes: number; // 0 when on time
  position: LatLng; // current position
  heading: number; // degrees, used to rotate the plane icon
  altitudeFt: number;
  groundSpeedKt: number;
  progress: number; // 0..1 along the route
}

export interface FlightFilters {
  callsign: string;
  status: FlightStatus | null;
  origin: string | null;
  destination: string | null;
}

export interface FlightKpis {
  total: number;
  active: number;
  delayed: number;
  arrived: number;
  avgDelayMinutes: number;
}
