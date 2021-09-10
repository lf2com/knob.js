import Knob from '../knob';
import Events from '../values/events';
import {
  addEventListeners, removeEventListeners, triggerEvent,
} from './eventHandler';
import getEventXY from './getEventXY';
import {
  getDiffRadius, getQuadrant, getRadiusOfQuadrant,
  radiusToDegree,
} from './radiusAndDegree';

const EVENT_TOUCH_START = ['mousedown', 'touchstart'];
const EVENT_TOUCH_MOVE = ['mousemove', 'touchmove'];
const EVENT_TOUCH_END = ['mouseup', 'touchend'];

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
  event: MouseEvent | TouchEvent,
): void {
  const {
    degree: startDegree,
  } = this;
  const allStartEventsPassed = triggerEvent<SpinEventDetail>(
    this,
    Events.spinStart,
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

  if (!allStartEventsPassed) {
    return;
  }

  const {
    top, right, bottom, left,
  } = this.getBoundingClientRect();
  const center = {
    x: (right + left) / 2,
    y: (top + bottom) / 2,
  };
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
  const spinningListener = (evt: MouseEvent | TouchEvent) => {
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
    const allMoveEventsPassed = triggerEvent<SpinEventDetail>(
      this,
      Events.spinning,
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

    if (!allMoveEventsPassed) {
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
      Events.spinEnd,
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
