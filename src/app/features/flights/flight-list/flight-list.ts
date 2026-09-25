import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { Flight } from '../../../core/models/flight.model';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FlightListItem } from '../flight-list-item/flight-list-item';

@Component({
  selector: 'app-flight-list',
  imports: [FlightListItem, EmptyState],
  templateUrl: './flight-list.html',
  styleUrl: './flight-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightList {
  readonly flights = input.required<Flight[]>();
  readonly total = input(0);
  readonly selectedId = input<string | null>(null);
  readonly flightSelect = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // When a flight is selected on the MAP, scroll its row into view
    effect(() => {
      const id = this.selectedId();
      if (!id) return;
      requestAnimationFrame(() =>
        this.host.nativeElement
          .querySelector(`[data-flight-id="${id}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
      );
    });
  }
}
