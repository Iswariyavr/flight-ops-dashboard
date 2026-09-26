import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClockService } from '../../core/services/clock';
import { ThemeService } from '../../core/services/theme';
import { LoadStatus } from '../../core/state/flight-store';

const FEED_LABEL: Record<LoadStatus, string> = {
  loading: 'Connecting…',
  ready: 'Mock feed · connected',
  error: 'Feed offline',
};

@Component({
  selector: 'app-app-header',
  imports: [DatePipe],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  readonly feedStatus = input<LoadStatus>('loading');
  readonly showMenuButton = input(false);
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();

  protected readonly theme = inject(ThemeService);
  protected readonly now = toSignal(inject(ClockService).now$, { initialValue: new Date() });
  protected readonly feedLabel = computed(() => FEED_LABEL[this.feedStatus()]);
}
