import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FlightStatus } from '../../../core/models/flight.model';
import { STATUS_META } from '../../../core/models/flight-status';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<FlightStatus>();
  protected readonly meta = computed(() => STATUS_META[this.status()]);
}
