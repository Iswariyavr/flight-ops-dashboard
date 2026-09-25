import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Flight } from '../../../core/models/flight.model';

@Component({
  selector: 'app-attention-list',
  templateUrl: './attention-list.html',
  styleUrl: './attention-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttentionList {
  readonly flights = input.required<Flight[]>();
  readonly flightSelect = output<string>();
}
