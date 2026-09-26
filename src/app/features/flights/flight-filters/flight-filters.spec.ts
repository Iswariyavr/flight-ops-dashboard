import { TestBed } from '@angular/core/testing';
import { FlightFilters, FlightStatus } from '../../../core/models/flight.model';
import { EMPTY_FILTERS } from '../../../core/state/flight.selectors';
import { AIRPORTS, FLIGHTS } from '../../../testing/flight-fixtures';
import { FlightFiltersPanel } from './flight-filters';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function setup() {
  const fixture = TestBed.createComponent(FlightFiltersPanel);
  fixture.componentRef.setInput('flights', FLIGHTS);
  fixture.componentRef.setInput('airports', AIRPORTS);

  const emitted: FlightFilters[] = [];
  fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));

  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const selects = el.querySelectorAll('select');

  return {
    fixture,
    el,
    emitted,
    search: el.querySelector('input[type="search"]') as HTMLInputElement,
    status: selects[0],
    origin: selects[1],
    destination: selects[2],
  };
}

function choose(select: HTMLSelectElement, index: number) {
  select.selectedIndex = index;
  select.dispatchEvent(new Event('change'));
}

describe('FlightFiltersPanel', () => {
  it('debounces typing and emits a trimmed callsign', async () => {
    const { search, emitted } = await setup();

    search.value = '  igo ';
    search.dispatchEvent(new Event('input'));

    expect(emitted).toHaveLength(0); // not yet: still debouncing
    await wait(250);

    expect(emitted.at(-1)).toEqual({ ...EMPTY_FILTERS, callsign: 'igo' });
  });

  it('emits the chosen status', async () => {
    const { status, emitted } = await setup();

    choose(status, 2); // 0 = All, 1 = En route, 2 = Delayed
    await wait(250);

    expect(emitted.at(-1)?.status).toBe(FlightStatus.Delayed);
  });

  it('only offers destinations served from the chosen origin', async () => {
    const { fixture, origin, destination } = await setup();

    choose(origin, 3); // Any, BLR, BOM, DEL → DEL
    await fixture.whenStable();

    const options = Array.from(destination.options).map((o) => o.textContent?.trim());
    expect(options).toEqual(['Any', 'BLR · Bengaluru', 'BOM · Mumbai']);
  });

  it('resets every field', async () => {
    const { el, search, emitted } = await setup();

    search.value = 'igo';
    search.dispatchEvent(new Event('input'));
    await wait(250);

    (el.querySelector('.link-btn') as HTMLButtonElement).click();
    await wait(250);

    expect(emitted.at(-1)).toEqual(EMPTY_FILTERS);
  });
});
