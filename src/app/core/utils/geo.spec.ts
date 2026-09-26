import { greatCirclePoints } from './geo';
import { bearing, greatCirclePoints, interpolateGreatCircle } from './geo';

const DEL = { lat: 28.5562, lng: 77.1 };
const BLR = { lat: 13.1986, lng: 77.7066 };

describe('greatCirclePoints', () => {
  it('starts at the origin and ends at the destination', () => {
    const points = greatCirclePoints(DEL, BLR);
    const [firstLat, firstLng] = points[0];
    const [lastLat, lastLng] = points[points.length - 1];

    expect(firstLat).toBeCloseTo(DEL.lat, 6);
    expect(firstLng).toBeCloseTo(DEL.lng, 6);
    expect(lastLat).toBeCloseTo(BLR.lat, 6);
    expect(lastLng).toBeCloseTo(BLR.lng, 6);
  });

  it('returns segments + 1 points', () => {
    expect(greatCirclePoints(DEL, BLR, 10)).toHaveLength(11);
  });

  it('keeps intermediate points between the two latitudes', () => {
    const [midLat] = greatCirclePoints(DEL, BLR, 10)[5];
    expect(midLat).toBeLessThan(DEL.lat);
    expect(midLat).toBeGreaterThan(BLR.lat);
  });

  it('returns a single point when origin equals destination', () => {
    expect(greatCirclePoints(DEL, DEL)).toEqual([[DEL.lat, DEL.lng]]);
  });
});

describe('interpolateGreatCircle', () => {
  it('returns the endpoints at 0 and 1', () => {
    const start = interpolateGreatCircle(DEL, BLR, 0);
    const end = interpolateGreatCircle(DEL, BLR, 1);

    expect(start.lat).toBeCloseTo(DEL.lat, 6);
    expect(end.lat).toBeCloseTo(BLR.lat, 6);
  });
});

describe('bearing', () => {
  it('is 0° when heading due north', () => {
    expect(bearing({ lat: 0, lng: 0 }, { lat: 10, lng: 0 })).toBeCloseTo(0);
  });

  it('is 90° when heading due east along the equator', () => {
    expect(bearing({ lat: 0, lng: 0 }, { lat: 0, lng: 10 })).toBeCloseTo(90);
  });

  it('points roughly south from Delhi to Bengaluru', () => {
    const deg = bearing(DEL, BLR);
    expect(deg).toBeGreaterThan(170);
    expect(deg).toBeLessThan(190);
  });
});
