import * as L from 'leaflet';
import { Flight } from '../../../core/models/flight.model';
import { PlaneState, flightTooltipHtml, planeIcon } from '../map-icons';

export class FlightMarkerLayer {
  private readonly group = L.layerGroup();
  private readonly markers = new Map<string, L.Marker>();

  constructor(
    map: L.Map,
    private readonly onSelect: (flightId: string) => void,
  ) {
    this.group.addTo(map);
  }

  update(flights: Flight[], selectedId: string | null): void {
    const incomingIds = new Set(flights.map((f) => f.id));

    for (const [id, marker] of this.markers) {
      if (!incomingIds.has(id)) {
        this.group.removeLayer(marker);
        this.markers.delete(id);
      }
    }

    for (const flight of flights) {
      const state: PlaneState =
        selectedId === null ? 'normal' : flight.id === selectedId ? 'selected' : 'dimmed';
      const icon = planeIcon(flight, state);
      const existing = this.markers.get(flight.id);

      if (existing) {
        existing.setLatLng(flight.position);
        existing.setIcon(icon);
        existing.setTooltipContent(flightTooltipHtml(flight));
        existing.setZIndexOffset(state === 'selected' ? 1000 : 0);
      } else {
        const marker = L.marker(flight.position, {
          icon,
          title: `${flight.flightNumber}, ${flight.origin} to ${flight.destination}`,
          riseOnHover: true,
          zIndexOffset: state === 'selected' ? 1000 : 0,
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
