import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightFilters } from './flight-filters';

describe('FlightFilters', () => {
  let component: FlightFilters;
  let fixture: ComponentFixture<FlightFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
