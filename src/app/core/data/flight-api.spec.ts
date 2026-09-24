import { TestBed } from '@angular/core/testing';

import { FlightApi } from './flight-api';

describe('FlightApi', () => {
  let service: FlightApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
