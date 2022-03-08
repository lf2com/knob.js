import Knob from '../knob';
import createPoint from '../types/Point';
import Event from '../values/event';
import { addEventListeners, removeEventListeners, triggerEvent } from './eventHandler';
import getEventXY from './getEventXY';
import {
  getDiffRadius, getQuadrant, getRadiusOfQuadrant, radiusToDegree,
} from './radiusAndDegree';

const EVENT_TOUCH_START = ['pointerdown'];
const EVENT_TOUCH_MOVE = ['pointermove'];
const EVENT_TOUCH_END = ['pointerup'];

export interface SpinEventDetail {
  degree: number;
  lastDegree: number;
  offsetDegree: number;
}

/**
 * Handles spinstart event binded with mousestart/touchstart
 * events.
 */
function spinStartListener(
  this: Knob,
  event: PointerEvent,
): void {
  const {
    degree: startDegree,
  } = this;
  const passedStartEvent = triggerEvent<SpinEventDetail>(
    this,
    Event.spinStart,
    {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        degree: startDegree,
        lastDegree: startDegree,
        offsetDegree: 0,
      },
    },
  );

  if (!passedStartEvent) {
    return;
  }

  const {
    top, right, bottom, left,
  } = this.getBoundingClientRect();
  const center = createPoint(
    (right + left) / 2,
    (top + bottom) / 2,
  );
  const startPressPoint = getEventXY(event);
  const startPressQuadrant = getQuadrant(
    startPressPoint,
    center,
  );
  const startPressRadius = getRadiusOfQuadrant(
    startPressPoint,
    center,
    startPressQuadrant,
  );

  let totalDiffDegree = 0;
  let lastQuadrant = startPressQuadrant;
  let lastRadius = startPressRadius;

  /**
   * Handles spinning/changing events binded with
   * mousemove/touchmove events.
   */
  const spinningListener = (evt: PointerEvent) => {
    const pressPoint = getEventXY(evt);
    const pressQuadrant = getQuadrant(
      pressPoint,
      center,
    );
    const pressRadius = getRadiusOfQuadrant(
      pressPoint,
      center,
      pressQuadrant,
    );
    const diffRadius = getDiffRadius(
      lastQuadrant,
      lastRadius,
      pressQuadrant,
      pressRadius,
    );
    const diffDegree = radiusToDegree(diffRadius);
    const {
      degree: lastDegree,
    } = this;

    totalDiffDegree += diffDegree;

    const nextDegree = startDegree + totalDiffDegree;
    const passedMoveEvent = triggerEvent<SpinEventDetail>(
      this,
      Event.spinning,
      {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          degree: nextDegree,
          lastDegree,
          offsetDegree: totalDiffDegree,
        },
      },
    );

    lastQuadrant = pressQuadrant;
    lastRadius = pressRadius;

    if (!passedMoveEvent) {
      return;
    }

    this.degree = nextDegree;
  };

  /**
   * Handles spinend/changed events binded with mouseup/touchend
   * events.
   */
  const spinEndListener = () => {
    const { degree } = this;

    removeEventListeners(document, EVENT_TOUCH_MOVE, spinningListener);
    removeEventListeners(document, EVENT_TOUCH_END, spinEndListener);
    triggerEvent<SpinEventDetail>(
      this,
      Event.spinEnd,
      {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          degree,
          lastDegree: startDegree,
          offsetDegree: totalDiffDegree,
        },
      },
    );
  };

  event.preventDefault();
  addEventListeners(document, EVENT_TOUCH_MOVE, spinningListener);
  addEventListeners(document, EVENT_TOUCH_END, spinEndListener);
}

/**
 * Adds listeners of Knob.
 */
export function addSpinListeners(ref: Knob): void {
  addEventListeners(ref, EVENT_TOUCH_START, spinStartListener);
}

/**
 * Removes listeners of Knob.
 */
export function removeSpinListeners(ref: Knob): void {
  removeEventListeners(ref, EVENT_TOUCH_START, spinStartListener);
}

export default spinStartListener;
