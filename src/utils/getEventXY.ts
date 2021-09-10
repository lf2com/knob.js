import Point from './Point';

/**
 * Returns (x, y) of moust/touch event.
 */
function getEventXY(event: MouseEvent | TouchEvent): Point {
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
  if (event instanceof TouchEvent) {
    const { touches: [touch] } = event;
    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  throw new ReferenceError(`Illegal event: ${event}`);
}

export default getEventXY;
