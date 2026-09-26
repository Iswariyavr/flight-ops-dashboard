import * as L from 'leaflet';
import { Flight } from '../../../core/models/flight.model';
import { PlaneState, flightTooltipHtml, planeIcon } from '../map-icons';

export class FlightMarkerLayer {
  private readonly group = L.layerGroup();
  private readonly markers = new Map<string, L.Marker>();
  /** Remembers what each icon currently shows, to skip needless redraws. */
  private readonly iconKeys = new Map<string, string>();

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
        this.iconKeys.delete(id);
      }
    }

    for (const flight of flights) {
      const state: PlaneState =
        selectedId === null ? 'normal' : flight.id === selectedId ? 'selected' : 'dimmed';
      const iconKey = `${flight.status}|${state}|${Math.round(flight.heading)}`;
      const zIndex = state === 'selected' ? 1000 : 0;
      const existing = this.markers.get(flight.id);

      if (existing) {
        existing.setLatLng(flight.position); // cheap: just moves it

        if (this.iconKeys.get(flight.id) !== iconKey) {
          existing.setIcon(planeIcon(flight, state));
          existing.setTooltipContent(flightTooltipHtml(flight));
          existing.setZIndexOffset(zIndex);
          this.iconKeys.set(flight.id, iconKey);
        }
      } else {
        const marker = L.marker(flight.position, {
          icon: planeIcon(flight, state),
          title: `${flight.flightNumber}, ${flight.origin} to ${flight.destination}`,
          riseOnHover: true,
          zIndexOffset: zIndex,
        })
          .bindTooltip(flightTooltipHtml(flight), {
            direction: 'top',
            offset: [0, -12],
            className: 'flight-tooltip',
          })
          .on('click', () => this.onSelect(flight.id));

        marker.addTo(this.group);
        this.markers.set(flight.id, marker);
        this.iconKeys.set(flight.id, iconKey);
      }
    }
  }

  destroy(): void {
    this.group.clearLayers();
    this.group.remove();
    this.markers.clear();
    this.iconKeys.clear();
  }
}
