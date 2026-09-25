import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Airport, Flight, FlightFilters, FlightStatus } from '../../../core/models/flight.model';
import { STATUS_META } from '../../../core/models/flight-status';
import { countByStatus } from '../../../core/state/flight.selectors';

@Component({
  selector: 'app-flight-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './flight-filters.html',
  styleUrl: './flight-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightFiltersPanel {
  readonly flights = input.required<Flight[]>();
  readonly airports = input<Airport[]>([]);
  readonly filtersChange = output<FlightFilters>();

  private readonly fb = inject(NonNullableFormBuilder);

  /** Typed form: TypeScript knows every field's type. */
  protected readonly form = this.fb.group({
    callsign: '',
    status: this.fb.control<FlightStatus | null>(null),
    origin: this.fb.control<string | null>(null),
    destination: this.fb.control<string | null>(null),
  });

  protected readonly statusMeta = STATUS_META;
  protected readonly statusOptions: FlightStatus[] = [
    FlightStatus.EnRoute,
    FlightStatus.Delayed,
    FlightStatus.Arrived,
    FlightStatus.Boarding,
    FlightStatus.Scheduled,
  ];

  protected readonly statusCounts = computed(() => countByStatus(this.flights()));

  private readonly originValue = toSignal(this.form.controls.origin.valueChanges, {
    initialValue: null,
  });

  /** Only airports that actually have departures. */
  protected readonly originOptions = computed(() =>
    this.airportsFor(this.flights().map((f) => f.origin)),
  );

  /** Cascading: once an origin is chosen, only show destinations served from it. */
  protected readonly destinationOptions = computed(() => {
    const origin = this.originValue();
    return this.airportsFor(
      this.flights()
        .filter((f) => !origin || f.origin === origin)
        .map((f) => f.destination),
    );
  });

  constructor() {
    // Form → parent (debounced so typing doesn't filter on every keystroke)
    this.form.valueChanges
      .pipe(
        debounceTime(200),
        map(() => this.form.getRawValue()),
        map((v) => ({ ...v, callsign: v.callsign.trim() })),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(),
      )
      .subscribe((filters) => this.filtersChange.emit(filters));

    // If the chosen destination isn't served from the new origin, clear it
    this.form.controls.origin.valueChanges.pipe(takeUntilDestroyed()).subscribe((origin) => {
      const destination = this.form.controls.destination.value;
      const stillValid =
        !origin ||
        !destination ||
        this.flights().some((f) => f.origin === origin && f.destination === destination);
      if (!stillValid) this.form.controls.destination.setValue(null);
    });
  }

  protected reset(): void {
    this.form.reset();
  }

  private airportsFor(codes: string[]): Airport[] {
    const wanted = new Set(codes);
    return this.airports()
      .filter((a) => wanted.has(a.code))
      .sort((a, b) => a.code.localeCompare(b.code));
  }
}
