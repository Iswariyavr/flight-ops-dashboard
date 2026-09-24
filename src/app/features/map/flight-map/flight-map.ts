import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { Airport, Flight } from '../../../core/models/flight.model';
import { AirportLayer } from '../layers/airport.layer';
import { FlightMarkerLayer } from '../layers/flight-marker.layer';

const INDIA_CENTER: L.LatLngExpression = [22.5, 80];
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

@Component({
  selector: 'app-flight-map',
  templateUrl: './flight-map.html',
  styleUrl: './flight-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightMap {
  // Data IN
  readonly flights = input.required<Flight[]>();
  readonly airports = input<Airport[]>([]);
  // Events OUT
  readonly flightSelect = output<string>();

  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private readonly ready = signal(false);

  private map?: L.Map;
  private flightLayer?: FlightMarkerLayer;
  private airportLayer?: AirportLayer;
  private resizeObserver?: ResizeObserver;

  constructor() {
    // 1. Create the map only after the <div> exists in the page
    afterNextRender(() => {
      this.initMap();
      this.ready.set(true);
    });

    // 2. Whenever flights change (and the map is ready), update the markers
    effect(() => {
      const flights = this.flights();
      if (this.ready()) this.flightLayer?.update(flights);
    });

    effect(() => {
      const airports = this.airports();
      if (this.ready()) this.airportLayer?.update(airports);
    });

    // 3. Clean up when the component is destroyed (prevents memory leaks)
    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.flightLayer?.destroy();
      this.airportLayer?.destroy();
      this.map?.remove();
    });
  }

  private initMap(): void {
    const el = this.mapEl().nativeElement;

    this.map = L.map(el, { center: INDIA_CENTER, zoom: 5, minZoom: 4, maxZoom: 10 });

    L.tileLayer(DARK_TILES, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
    }).addTo(this.map);

    // Order matters: airports first so planes are drawn on top
    this.airportLayer = new AirportLayer(this.map);
    this.flightLayer = new FlightMarkerLayer(this.map, (id) => this.flightSelect.emit(id));

    // If the container changes size (panel resize, window resize), re-measure
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(el);
  }
}
