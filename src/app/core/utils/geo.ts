import { LatLng } from '../models/flight.model';

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Angle (radians) between two points on the globe – haversine formula. */
function angularDistance(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLat = lat2 - lat1;
  const dLng = toRad(to.lng - from.lng);
  return (
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2,
      ),
    )
  );
}

/** Point at `fraction` (0 = origin, 1 = destination) along the great-circle route. */
export function interpolateGreatCircle(from: LatLng, to: LatLng, fraction: number): LatLng {
  const d = angularDistance(from, to);
  if (d === 0) return { ...from };

  const lat1 = toRad(from.lat);
  const lng1 = toRad(from.lng);
  const lat2 = toRad(to.lat);
  const lng2 = toRad(to.lng);

  const a = Math.sin((1 - fraction) * d) / Math.sin(d);
  const b = Math.sin(fraction * d) / Math.sin(d);
  const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
  const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDeg(Math.atan2(y, x)),
  };
}

/** Points along the great-circle path, for drawing route lines. */
export function greatCirclePoints(from: LatLng, to: LatLng, segments = 64): [number, number][] {
  if (angularDistance(from, to) === 0) return [[from.lat, from.lng]];

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const p = interpolateGreatCircle(from, to, i / segments);
    points.push([p.lat, p.lng]);
  }
  return points;
}

/** Compass direction (0 = north, 90 = east) from one point towards another. */
export function bearing(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
