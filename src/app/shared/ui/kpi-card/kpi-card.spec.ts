import { TestBed } from '@angular/core/testing';
import { KpiCard } from './kpi-card';

async function render(inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(KpiCard);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('KpiCard', () => {
  it('shows label, value and hint', async () => {
    const el = await render({ label: 'Active flights', value: 10, hint: 'Airborne now' });

    expect(el.querySelector('.label')?.textContent).toContain('Active flights');
    expect(el.querySelector('.value')?.textContent?.trim()).toBe('10');
    expect(el.querySelector('.hint')?.textContent).toContain('Airborne now');
  });

  it('sizes the progress bar from the ratio', async () => {
    const el = await render({ label: 'Delayed', value: 3, ratio: 0.25 });
    expect((el.querySelector('.fill') as HTMLElement).style.width).toBe('25%');
  });

  it('clamps the ratio between 0% and 100%', async () => {
    const el = await render({ label: 'Delayed', value: 3, ratio: 4 });
    expect((el.querySelector('.fill') as HTMLElement).style.width).toBe('100%');
  });

  it('applies the tone class', async () => {
    const el = await render({ label: 'Delayed', value: 3, tone: 'delayed' });
    expect(el.querySelector('.kpi')?.classList).toContain('tone-delayed');
  });
});
