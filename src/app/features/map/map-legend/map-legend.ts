import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FlightStatus } from '../../../core/models/flight.model';
import { STATUS_META } from '../../../core/models/flight-status';

const ORDER: FlightStatus[] = [
  FlightStatus.EnRoute,
  FlightStatus.Delayed,
  FlightStatus.Arrived,
  FlightStatus.Boarding,
  FlightStatus.Scheduled,
];

@Component({
  selector: 'app-map-legend',
  templateUrl: './map-legend.html',
  styleUrl: './map-legend.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapLegend {
  readonly counts = input.required<Record<FlightStatus, number>>();

  protected readonly items = computed(() =>
    ORDER.map((status) => ({ status, ...STATUS_META[status], count: this.counts()[status] })),
  );
}
