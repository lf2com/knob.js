import { createPoint } from '../types/Point';

export type TouchLikeEvent = MouseEvent | TouchEvent | PointerEvent;

/**
 * Returns (x, y) of moust/touch event.
 */
function getEventXY(event: TouchLikeEvent): DOMPoint {
  if (event instanceof TouchEvent) {
    const { touches } = event;
    const touch = touches.item(0);
    const {
      clientX = 0,
      clientY = 0,
    } = touch ?? {};

    return createPoint(clientX, clientY);
  }

  const { clientX, clientY } = event;

  return createPoint(clientX, clientY);
}

export default getEventXY;
