import * as L from 'leaflet';
import { Airport } from '../../../core/models/flight.model';
import { airportIcon } from '../map-icons';

export class AirportLayer {
  private readonly group = L.layerGroup();

  constructor(map: L.Map) {
    this.group.addTo(map);
  }

  update(airports: Airport[]): void {
    this.group.clearLayers(); // airports never change, so a simple redraw is fine
    for (const airport of airports) {
      L.marker(airport.position, { icon: airportIcon(airport), keyboard: false })
        .bindTooltip(`${airport.name}, ${airport.city}`, { direction: 'top' })
        .addTo(this.group);
    }
  }

  destroy(): void {
    this.group.clearLayers();
    this.group.remove();
  }
}
