import * as L from 'leaflet';
import { Airport, Flight } from '../../../core/models/flight.model';
import { greatCirclePoints } from '../../../core/utils/geo';

/** Draws the selected flight's route: full path (dashed) + flown part (solid). */
export class RouteLayer {
  private readonly group = L.layerGroup();

  constructor(map: L.Map) {
    this.group.addTo(map);
  }

  show(flight: Flight, origin: Airport, destination: Airport): void {
    this.group.clearLayers();

    // Full planned route
    L.polyline(greatCirclePoints(origin.position, destination.position), {
      className: 'route-line',
      interactive: false,
    }).addTo(this.group);

    // Part already flown (origin → current position)
    if (flight.airborne || flight.progress >= 1) {
      L.polyline(greatCirclePoints(origin.position, flight.position), {
        className: 'route-line route-line--flown',
        interactive: false,
      }).addTo(this.group);
    }

    // Endpoints
    for (const ap of [origin, destination]) {
      L.circleMarker(ap.position, {
        radius: 5,
        className: 'route-endpoint',
        interactive: false,
      }).addTo(this.group);
    }
  }

  clear(): void {
    this.group.clearLayers();
  }

  destroy(): void {
    this.group.clearLayers();
    this.group.remove();
  }
}
