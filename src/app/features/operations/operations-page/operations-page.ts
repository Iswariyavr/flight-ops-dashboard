import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { FlightFilters } from '../../../core/models/flight.model';
import { EMPTY_KPIS, countByStatus } from '../../../core/state/flight.selectors';
import { FlightStore } from '../../../core/state/flight-store';
import { AppHeader } from '../../../layout/app-header/app-header';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { KpiCard } from '../../../shared/ui/kpi-card/kpi-card';
import { AttentionList } from '../../flights/attention-list/attention-list';
import { FlightDetails } from '../../flights/flight-details/flight-details';
import { FlightFiltersPanel } from '../../flights/flight-filters/flight-filters';
import { FlightList } from '../../flights/flight-list/flight-list';
import { FlightMap } from '../../map/flight-map/flight-map';
import { MapLegend } from '../../map/map-legend/map-legend';

@Component({
  selector: 'app-operations-page',
  imports: [
    AppHeader,
    FlightMap,
    MapLegend,
    FlightDetails,
    EmptyState,
    FlightFiltersPanel,
    FlightList,
    KpiCard,
    AttentionList,
  ],
  templateUrl: './operations-page.html',
  styleUrl: './operations-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class OperationsPage {
  private readonly store = inject(FlightStore);
  private readonly router = inject(Router);

  // Data
  protected readonly loadStatus = toSignal(this.store.loadStatus$, { initialValue: 'loading' });
  protected readonly flights = toSignal(this.store.flights$, { initialValue: [] });
  protected readonly airports = toSignal(this.store.airports$, { initialValue: [] });
  protected readonly filteredFlights = toSignal(this.store.filteredFlights$, { initialValue: [] });
  protected readonly kpis = toSignal(this.store.kpis$, { initialValue: EMPTY_KPIS });
  protected readonly attention = toSignal(this.store.attention$, { initialValue: [] });

  // Selection
  protected readonly selectedId = toSignal(this.store.selectedId$, { initialValue: null });
  protected readonly selectedFlight = toSignal(this.store.selectedFlight$, { initialValue: null });

  // Layout: tablet portrait and below gets a slide-in flight panel
  protected readonly isNarrow = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 1023.98px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );
  protected readonly listOpen = signal(false);

  // Derived
  protected readonly airportsByCode = computed(
    () => new Map(this.airports().map((a) => [a.code, a])),
  );
  protected readonly statusCounts = computed(() => countByStatus(this.filteredFlights()));

  protected readonly mapFlights = computed(() => {
    const list = this.filteredFlights();
    const selected = this.selectedFlight();
    return selected && !list.some((f) => f.id === selected.id) ? [...list, selected] : list;
  });

  protected readonly notFound = computed(
    () => !!this.selectedId() && this.flights().length > 0 && !this.selectedFlight(),
  );

  constructor() {
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

  protected onFiltersChange(filters: FlightFilters): void {
    this.store.setFilters(filters);
  }

  protected onFlightSelect(id: string): void {
    this.router.navigate(['/ops/flight', id]);
    if (this.isNarrow()) this.listOpen.set(false); // reveal the map after picking
  }

  protected clearSelection(): void {
    if (this.selectedId()) this.router.navigate(['/ops']);
  }

  protected toggleList(): void {
    this.listOpen.update((open) => !open);
  }

  protected closeDrawers(): void {
    this.listOpen.set(false);
    this.clearSelection();
  }

  protected onEscape(): void {
    if (this.listOpen()) {
      this.listOpen.set(false);
    } else {
      this.clearSelection();
    }
  }

  protected retry(): void {
    this.store.retry();
  }

  protected ratio(count: number): number {
    const total = this.kpis().total;
    return total ? count / total : 0;
  }

  private readFlightIdFromUrl(): string | null {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.paramMap.get('id');
  }
}
