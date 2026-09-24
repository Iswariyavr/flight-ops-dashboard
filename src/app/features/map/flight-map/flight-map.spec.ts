import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightMap } from './flight-map';

describe('FlightMap', () => {
  let component: FlightMap;
  let fixture: ComponentFixture<FlightMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightMap],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
