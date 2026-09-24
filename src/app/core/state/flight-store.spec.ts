import { TestBed } from '@angular/core/testing';

import { FlightStore } from './flight-store';

describe('FlightStore', () => {
  let service: FlightStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
