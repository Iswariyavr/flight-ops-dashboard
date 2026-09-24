import { FlightStatus } from './flight.model';

/** Display info for each status, used by map icons, badges and lists. */
export const STATUS_META: Record<FlightStatus, { label: string; cssClass: string }> = {
  [FlightStatus.EnRoute]: { label: 'En route', cssClass: 'enroute' },
  [FlightStatus.Delayed]: { label: 'Delayed', cssClass: 'delayed' },
  [FlightStatus.Arrived]: { label: 'Arrived', cssClass: 'arrived' },
  [FlightStatus.Boarding]: { label: 'Boarding', cssClass: 'boarding' },
  [FlightStatus.Scheduled]: { label: 'Scheduled', cssClass: 'scheduled' },
};
