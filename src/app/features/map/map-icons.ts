import * as L from 'leaflet';
import { Airport, Flight } from '../../core/models/flight.model';
import { STATUS_META } from '../../core/models/flight-status';

// Simple plane shape pointing north (up); we rotate it by the flight's heading.
const PLANE_PATH =
  'M12 2 L13.5 9 L21 13 L21 15 L13.5 12.5 L13 18 L15.5 20 L15.5 21.5 L12 20.5 ' +
  'L8.5 21.5 L8.5 20 L11 18 L10.5 12.5 L3 15 L3 13 L10.5 9 Z';

export function planeIcon(flight: Flight): L.DivIcon {
  const meta = STATUS_META[flight.status];
  return L.divIcon({
    className: `flight-icon is-${meta.cssClass}`,
    html: `
      <div class="plane" style="transform: rotate(${flight.heading}deg)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PLANE_PATH}" /></svg>
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14], // center of the icon sits on the coordinate
  });
}

export function flightTooltipHtml(flight: Flight): string {
  const meta = STATUS_META[flight.status];
  return `
    <div class="ft-head">
      <strong>${flight.flightNumber}</strong>
      <span class="ft-callsign">${flight.callsign}</span>
    </div>
    <div class="ft-route">${flight.origin} → ${flight.destination}</div>
    <div class="ft-status is-${meta.cssClass}">${meta.label}</div>`;
}

export function airportIcon(airport: Airport): L.DivIcon {
  return L.divIcon({
    className: 'airport-icon',
    html: `<span class="ap-dot"></span><span class="ap-code">${airport.code}</span>`,
    iconSize: [40, 12],
    iconAnchor: [4, 6],
  });
}
