import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  interval,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs';

export const PLAYBACK_SPEEDS = [1, 5, 10] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

const TICK_MS = 100; // 10 updates per second

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  private readonly playingSubject = new BehaviorSubject<boolean>(false);
  private readonly speedSubject = new BehaviorSubject<PlaybackSpeed>(1);
  private readonly resetSubject = new Subject<void>();

  readonly playing$ = this.playingSubject.asObservable();
  readonly speed$ = this.speedSubject.asObservable();

  /**
   * Simulated minutes elapsed since the last reset.
   * 1× = one simulated minute per real second.
   */
  readonly elapsedMinutes$: Observable<number> = this.resetSubject.pipe(
    startWith(undefined),
    switchMap(() =>
      this.playingSubject.pipe(
        // Ticking only while playing; pausing switches to "no ticks"
        switchMap((playing) => (playing ? interval(TICK_MS) : EMPTY)),
        withLatestFrom(this.speedSubject),
        map(([, speed]) => (speed * TICK_MS) / 1000),
        // Add up all the steps = total simulated time
        scan((total, step) => total + step, 0),
        startWith(0),
      ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  toggle(): void {
    this.playingSubject.next(!this.playingSubject.value);
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.speedSubject.next(speed);
  }

  reset(): void {
    this.playingSubject.next(false);
    this.resetSubject.next();
  }
}
