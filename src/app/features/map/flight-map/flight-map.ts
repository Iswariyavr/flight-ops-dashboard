import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { Airport, Flight } from '../../../core/models/flight.model';
import { AirportLayer } from '../layers/airport.layer';
import { FlightMarkerLayer } from '../layers/flight-marker.layer';
import { RouteLayer } from '../layers/route.layer';

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
  readonly selectedId = input<string | null>(null);

  // Events OUT
  readonly flightSelect = output<string>();
  readonly selectionClear = output<void>();

  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private readonly ready = signal(false);

  private readonly selectedFlight = computed(() => {
    const id = this.selectedId();
    return id ? (this.flights().find((f) => f.id === id) ?? null) : null;
  });

  /** Only changes when a DIFFERENT flight becomes selectable, so we don't re-zoom on every update. */
  private readonly focusKey = computed(() => {
    const flight = this.selectedFlight();
    return flight && this.airports().length ? flight.id : null;
  });

  private map?: L.Map;
  private flightLayer?: FlightMarkerLayer;
  private airportLayer?: AirportLayer;
  private routeLayer?: RouteLayer;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.initMap();
      this.ready.set(true);
    });

    // Markers: redraw when flights or selection change
    effect(() => {
      const flights = this.flights();
      const selectedId = this.selectedId();
      if (this.ready()) this.flightLayer?.update(flights, selectedId);
    });

    // Airports
    effect(() => {
      const airports = this.airports();
      if (this.ready()) this.airportLayer?.update(airports);
    });

    // Route line
    effect(() => {
      const flight = this.selectedFlight();
      const airports = this.airports();
      if (!this.ready()) return;

      const origin = flight && airports.find((a) => a.code === flight.origin);
      const destination = flight && airports.find((a) => a.code === flight.destination);

      if (flight && origin && destination) {
        this.routeLayer?.show(flight, origin, destination);
      } else {
        this.routeLayer?.clear();
      }
    });

    // Zoom to the selected flight (only when the selection changes)
    effect(() => {
      const key = this.focusKey();
      if (this.ready() && key) untracked(() => this.focusSelected());
    });

    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.flightLayer?.destroy();
      this.airportLayer?.destroy();
      this.routeLayer?.destroy();
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

    // Layer order = drawing order: airports, then route, then planes on top
    this.airportLayer = new AirportLayer(this.map);
    this.routeLayer = new RouteLayer(this.map);
    this.flightLayer = new FlightMarkerLayer(this.map, (id) => this.flightSelect.emit(id));

    // Clicking empty map space clears the selection
    this.map.on('click', () => this.selectionClear.emit());

    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(el);
  }

  private focusSelected(): void {
    const flight = this.selectedFlight();
    if (!flight || !this.map) return;

    const origin = this.airports().find((a) => a.code === flight.origin);
    const destination = this.airports().find((a) => a.code === flight.destination);
    const points: L.LatLngExpression[] = [flight.position];
    if (origin) points.push(origin.position);
    if (destination) points.push(destination.position);

    const bounds = L.latLngBounds(points);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      this.map.fitBounds(bounds, { padding: [60, 60] });
    } else {
      this.map.flyToBounds(bounds, { padding: [60, 60], duration: 0.8 });
    }
  }
}
