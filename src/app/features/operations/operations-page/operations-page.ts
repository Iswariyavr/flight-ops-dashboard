import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
// import { FlightApiService } from '../../../core/data/flight-api.service'; // match your file name
import { AppHeader } from '../../../layout/app-header/app-header';
import { FlightMap } from '../../map/flight-map/flight-map';
import { FlightApiService } from '../../../core/data/flight-api';

@Component({
  selector: 'app-operations-page',
  imports: [AppHeader, FlightMap],
  templateUrl: './operations-page.html',
  styleUrl: './operations-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsPage {
  private readonly api = inject(FlightApiService);

  // Observable → Signal, so the template can read flights() directly
  protected readonly flights = toSignal(this.api.flights$, { initialValue: [] });
  protected readonly airports = toSignal(this.api.airports$, { initialValue: [] });

  // Temporary: we'll move this into a proper store in the next step
  protected readonly selectedId = signal<string | null>(null);

  protected onFlightSelect(id: string): void {
    this.selectedId.set(id);
  }
}
