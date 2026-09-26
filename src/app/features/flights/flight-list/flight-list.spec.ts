import { TestBed } from '@angular/core/testing';
import { FLIGHTS } from '../../../testing/flight-fixtures';
import { FlightList } from './flight-list';

async function setup(flights = FLIGHTS, total = 7) {
  const fixture = TestBed.createComponent(FlightList);
  fixture.componentRef.setInput('flights', flights);
  fixture.componentRef.setInput('total', total);

  const selected: string[] = [];
  fixture.componentInstance.flightSelect.subscribe((id) => selected.push(id));

  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, selected };
}

describe('FlightList', () => {
  it('renders one row per flight and the "X of Y" count', async () => {
    const { el } = await setup();

    expect(el.querySelectorAll('button.row')).toHaveLength(5);
    expect(el.querySelector('.count')?.textContent?.trim()).toBe('5 of 7');
  });

  it('emits the flight id when a row is clicked', async () => {
    const { el, selected } = await setup();

    (el.querySelectorAll('button.row')[2] as HTMLButtonElement).click();

    expect(selected).toEqual(['sg-303']);
  });

  it('shows an empty state when nothing matches', async () => {
    const { el } = await setup([], 18);

    expect(el.querySelector('button.row')).toBeNull();
    expect(el.textContent).toContain('No flights match your filters');
  });
});
