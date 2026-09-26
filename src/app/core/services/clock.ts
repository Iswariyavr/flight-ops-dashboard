import { Injectable } from '@angular/core';
import { Observable, map, shareReplay, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClockService {
  /** Emits the current time every second; one shared timer for the whole app. */
  readonly now$: Observable<Date> = timer(0, 1000).pipe(
    map(() => new Date()),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
