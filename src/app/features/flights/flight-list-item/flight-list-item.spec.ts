import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightListItem } from './flight-list-item';

describe('FlightListItem', () => {
  let component: FlightListItem;
  let fixture: ComponentFixture<FlightListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
