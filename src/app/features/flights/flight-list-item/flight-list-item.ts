import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Flight } from '../../../core/models/flight.model';
import { STATUS_META } from '../../../core/models/flight-status';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';

@Component({
  selector: 'app-flight-list-item',
  imports: [DatePipe, StatusBadge],
  templateUrl: './flight-list-item.html',
  styleUrl: './flight-list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightListItem {
  readonly flight = input.required<Flight>();
  protected readonly meta = computed(() => STATUS_META[this.flight().status]);
}
