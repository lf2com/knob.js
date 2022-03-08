interface CreatePoint {
  (x: number, y: number): DOMPoint;
  (point: DOMPoint): DOMPoint;
}

/**
 * Returns point object from a point or (x, y).
 */
export const createPoint: CreatePoint = function createPoint(
  x: number | DOMPoint,
  y?: number,
) {
  if (x instanceof DOMPoint) {
    return DOMPoint.fromPoint(x);
  }

  return new DOMPoint(x, y);
};

export default createPoint;
