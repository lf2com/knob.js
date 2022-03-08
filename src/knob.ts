import { triggerEvent } from './utils/eventHandler';
import registerElement from './utils/registerElement';
import {
  addSpinListeners, removeSpinListeners, SpinEventDetail,
} from './utils/spinListener';
import Attribute from './values/attribute';
import Event from './values/event';

const nodeName = 'knob-base';

const { isNaN } = globalThis;
const template = document.createElement('template');

export const defaultAttributeValues = {
  [Attribute.degree]: 0,
  [Attribute.min]: -Infinity,
  [Attribute.max]: Infinity,
};

template.innerHTML = `
  <style>
    :host {
      position: relative;
      display: inline-block;
      vertical-align: text-bottom;
    }

    knob {
      transform: rotate(var(--degree));
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
  <knob>
    <slot></slot>
    <cover>
      <slot name="pointer"></slot>
    </cover>
  </knob>
`;

class Knob extends HTMLElement {
  protected knobElement: HTMLElement;

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.append(template.content.cloneNode(true));
    this.knobElement = shadowRoot.querySelector('knob') as HTMLElement;
    Knob.observedAttributes.forEach((attrName) => {
      this.attributeChangedCallback(attrName);
    });
  }

  static get observedAttributes() {
    return [
      Attribute.disabled,
      Attribute.min,
      Attribute.max,
      Attribute.degree,
    ];
  }

  attributeChangedCallback(attrName: string) {
    switch (attrName) {
      default:
        break;

      case Attribute.disabled:
        this.disabled = this.hasAttribute(Attribute.disabled);
        break;

      case Attribute.min: {
        const min = Number(
          this.getAttribute(Attribute.min)
          ?? defaultAttributeValues[Attribute.min],
        );

        this.min = min;
        this.degree = Math.max(min, this.degree);
        break;
      }

      case Attribute.max: {
        const max = Number(
          this.getAttribute(Attribute.max)
          ?? defaultAttributeValues[Attribute.max],
        );

        this.max = max;
        this.degree = Math.min(max, this.degree);
        break;
      }

      case Attribute.degree:
        this.degree = Number(
          this.getAttribute(Attribute.degree)
          ?? defaultAttributeValues[Attribute.degree],
        );
        break;
    }
  }

  /**
   * Returns true if Knob is disabled.
   */
  get disabled(): boolean {
    return this.hasAttribute(Attribute.disabled);
  }

  /**
   * Sets Knob disabled.
   */
  set disabled(disabled: boolean) {
    if (disabled) {
      removeSpinListeners(this);
      this.setAttribute(Attribute.disabled, '');
    } else {
      addSpinListeners(this);
      this.removeAttribute(Attribute.disabled);
    }
  }

  /**
   * Returns min degree.
   */
  get min(): number {
    const min = this.getAttribute(Attribute.min);

    return (min === null
      ? defaultAttributeValues[Attribute.min]
      : Number(min)
    );
  }

  /**
   * Sets min degree.
   */
  set min(min: number) {
    if (isNaN(min)) {
      throw new TypeError(`Invalid min degree: ${min}`);
    }
    if (min === this.min) {
      return;
    }

    this.setAttribute(Attribute.min, `${min}`);

    if (this.max < min) {
      throw new RangeError(
        'Setting min degree that is greater than max degree might cause spinning error',
      );
    }
  }

  /**
   * Returns max degree.
   */
  get max(): number {
    const max = this.getAttribute(Attribute.max);

    return (max === null
      ? defaultAttributeValues[Attribute.max]
      : Number(max)
    );
  }

  /**
   * Sets max degree.
   */
  set max(max: number) {
    if (isNaN(max)) {
      throw new TypeError(`Invalid max degree: ${max}`);
    }
    if (max === this.max) {
      return;
    }

    this.setAttribute(Attribute.max, `${max}`);

    if (this.min > max) {
      throw new RangeError(
        'Setting max degree that is less than min degree might cause spinning error',
      );
    }
  }

  /**
   * Returns degree.
   */
  get degree(): number {
    const degree = this.getAttribute(Attribute.degree);

    return (degree === null
      ? defaultAttributeValues[Attribute.degree]
      : Number(degree)
    );
  }

  /**
   * Sets degree.
   */
  set degree(degree: number) {
    if (isNaN(degree)) {
      throw new TypeError(`Invalid degree: ${degree}`);
    }

    const {
      degree: lastDegree,
      min,
      max,
    } = this;
    const newDegree = Math.max(
      min,
      Math.min(degree, max),
    );

    if (newDegree === lastDegree) {
      return;
    }

    this.knobElement.style.setProperty('--degree', `${newDegree}deg`);
    this.setAttribute(Attribute.degree, `${newDegree}`);
    triggerEvent<SpinEventDetail>(this, Event.change, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        degree: newDegree,
        lastDegree,
        offsetDegree: newDegree - lastDegree,
      },
    });
  }

  /**
   * Alias of getting degree.
   */
  get value() {
    return this.degree;
  }

  /**
   * Alias of setting degree.
   */
  set value(value) {
    this.degree = value;
  }
}

registerElement(Knob, nodeName);

export default Knob;
