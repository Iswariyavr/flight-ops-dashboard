import * as L from 'leaflet';
import { Flight } from '../../../core/models/flight.model';
import { flightTooltipHtml, planeIcon } from '../map-icons';

/**
 * Draws one plane marker per flight.
 * update() DIFFS instead of redrawing: it adds new flights, moves existing
 * ones and removes flights that disappeared (e.g. filtered out).
 */
export class FlightMarkerLayer {
  private readonly group = L.layerGroup();
  private readonly markers = new Map<string, L.Marker>();

  constructor(
    map: L.Map,
    private readonly onSelect: (flightId: string) => void,
  ) {
    this.group.addTo(map);
  }

  update(flights: Flight[]): void {
    const incomingIds = new Set(flights.map((f) => f.id));

    // 1. Remove markers for flights that are no longer in the list
    for (const [id, marker] of this.markers) {
      if (!incomingIds.has(id)) {
        this.group.removeLayer(marker);
        this.markers.delete(id);
      }
    }

    // 2. Update existing markers, create missing ones
    for (const flight of flights) {
      const existing = this.markers.get(flight.id);
      if (existing) {
        existing.setLatLng(flight.position);
        existing.setIcon(planeIcon(flight));
        existing.setTooltipContent(flightTooltipHtml(flight));
      } else {
        const marker = L.marker(flight.position, {
          icon: planeIcon(flight),
          title: `${flight.flightNumber}, ${flight.origin} to ${flight.destination}`,
          riseOnHover: true,
        })
          .bindTooltip(flightTooltipHtml(flight), {
            direction: 'top',
            offset: [0, -12],
            className: 'flight-tooltip',
          })
          .on('click', () => this.onSelect(flight.id));

        marker.addTo(this.group);
        this.markers.set(flight.id, marker);
      }
    }
  }

  destroy(): void {
    this.group.clearLayers();
    this.group.remove();
    this.markers.clear();
  }
}
