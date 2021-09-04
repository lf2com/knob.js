import Point from './Point';

const { PI, hypot, asin } = Math;
const originPoint: Point = { x: 0, y: 0 };

type Quadrant = 1 | 2 | 3 | 4;

/**
 * Returns the quadrant [1, 4] of point from center. The value
 * is based on radius: Q1 = [0, PI / 2), Q2 = [PI / 2, PI),
 * Q3 = [PI, (3 * PI) / 2), Q4 = [(3 * PI) / 2, 2 * PI).
 */
export function getQuadrant(
  point: Point,
  center: Point = originPoint,
): Quadrant {
  if (point.y < center.y) {
    return point.x > center.x ? 1 : 2;
  }
  if (point.x < center.x) {
    return 3;
  }

  return point.y > center.y ? 4 : 1;
}

/**
 * Returns the radius value starting from the quadrant.
 */
export function getRadiusOfQuadrant(
  point: Point,
  center: Point = originPoint,
  quadrant = getQuadrant(point, center),
): number {
  const diffX = point.x - center.x;
  const diffY = point.y - center.y;
  const length = hypot(diffX, diffY);

  switch (quadrant) {
    default:
    case 1: return asin(-diffY / length);
    case 2: return asin(-diffX / length);
    case 3: return asin(diffY / length);
    case 4: return asin(diffX / length);
  }
}

/**
 * Returns positive value for clockwise, negative value for
 * counterclockwise.
 */
export function getDiffRadius(
  lastQuadrant: Quadrant,
  lastRadius: number,
  nextQuadrant: Quadrant,
  nextRadius: number,
): number {
  switch (nextQuadrant - lastQuadrant) {
    default:
    case 0:
      // the same quadrant
      return lastRadius - nextRadius;
    case -3:
    case 1:
      // to the next quadrant
      return lastRadius - nextRadius - PI / 2;
    case -1:
    case 3:
      // to the prev quadrant
      return lastRadius - nextRadius + PI / 2;
    case -2:
    case 2: {
      // to the diagonal quadrant
      const radius = lastRadius + PI - nextRadius;

      return radius > PI ? 2 * PI - radius : radius;
    }
  }
}

/**
 * Converts radius to degress.
 */
export function radiusToDegree(radius: number): number {
  return 180 * (radius / PI);
}
