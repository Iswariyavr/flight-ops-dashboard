import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type KpiTone = 'neutral' | 'enroute' | 'delayed' | 'arrived';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly hint = input('');
  /** 0..1, drives the small progress bar */
  readonly ratio = input(1);
  readonly tone = input<KpiTone>('neutral');

  protected readonly percent = computed(() =>
    Math.round(Math.min(1, Math.max(0, this.ratio())) * 100),
  );
}
