import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { FlightStore } from '../../../core/state/flight-store';
import { AppHeader } from '../../../layout/app-header/app-header';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FlightDetails } from '../../flights/flight-details/flight-details';
import { FlightMap } from '../../map/flight-map/flight-map';

@Component({
  selector: 'app-operations-page',
  imports: [AppHeader, FlightMap, FlightDetails, EmptyState],
  templateUrl: './operations-page.html',
  styleUrl: './operations-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'clearSelection()',
  },
})
export class OperationsPage {
  private readonly store = inject(FlightStore);
  private readonly router = inject(Router);

  protected readonly flights = toSignal(this.store.flights$, { initialValue: [] });
  protected readonly airports = toSignal(this.store.airports$, { initialValue: [] });
  protected readonly selectedId = toSignal(this.store.selectedId$, { initialValue: null });
  protected readonly selectedFlight = toSignal(this.store.selectedFlight$, { initialValue: null });

  protected readonly airportsByCode = computed(
    () => new Map(this.airports().map((a) => [a.code, a])),
  );

  /** A flight id is in the URL, data has loaded, but no such flight exists. */
  protected readonly notFound = computed(
    () => !!this.selectedId() && this.flights().length > 0 && !this.selectedFlight(),
  );

  constructor() {
    // URL → store: keep the selection in sync with /ops/flight/:id
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map(() => this.readFlightIdFromUrl()),
        startWith(this.readFlightIdFromUrl()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((id) => this.store.select(id));
  }

  protected onFlightSelect(id: string): void {
    this.router.navigate(['/ops/flight', id]);
  }

  protected clearSelection(): void {
    if (this.selectedId()) this.router.navigate(['/ops']);
  }

  private readFlightIdFromUrl(): string | null {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.paramMap.get('id');
  }
}
