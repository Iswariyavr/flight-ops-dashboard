import { TestBed } from '@angular/core/testing';
import { FlightStatus } from '../../../core/models/flight.model';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('shows a readable label and a status class', async () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', FlightStatus.Delayed);
    await fixture.whenStable();

    const badge = (fixture.nativeElement as HTMLElement).querySelector('.badge');
    expect(badge?.textContent?.trim()).toBe('Delayed');
    expect(badge?.classList).toContain('is-delayed');
  });
});
