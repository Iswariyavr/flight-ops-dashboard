import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Airport, Flight } from '../../../core/models/flight.model';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';

@Component({
  selector: 'app-flight-details',
  imports: [DatePipe, DecimalPipe, StatusBadge],
  templateUrl: './flight-details.html',
  styleUrl: './flight-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightDetails {
  readonly flight = input.required<Flight>();
  readonly origin = input<Airport | undefined>();
  readonly destination = input<Airport | undefined>();
  readonly closeDetails = output<void>();
}
