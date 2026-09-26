import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PLAYBACK_SPEEDS, PlaybackSpeed } from '../../../core/services/playback';

@Component({
  selector: 'app-map-toolbar',
  imports: [DecimalPipe],
  templateUrl: './map-toolbar.html',
  styleUrl: './map-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapToolbar {
  readonly playing = input(false);
  readonly speed = input<PlaybackSpeed>(1);
  readonly elapsedMinutes = input(0);

  readonly playToggle = output<void>();
  readonly resetPlayback = output<void>();
  readonly speedChange = output<PlaybackSpeed>();

  protected readonly speeds = PLAYBACK_SPEEDS;
}
