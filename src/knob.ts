import { triggerEvent } from './utils/eventHandler';
import registerElement from './utils/registerElement';
import {
  addSpinListeners, removeSpinListeners, SpinEventDetail,
} from './utils/spinListener';
import Attributes from './values/attributes';
import Events from './values/events';

const nodeName = 'knob-base';
const template = document.createElement('template');
const { isNaN } = globalThis;

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
  #disabled: boolean = false;

  #minDegree: number = -Infinity;

  #maxDegree: number = Infinity;

  #degree: number = 0;

  #domKnob: HTMLElement;

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.append(template.content.cloneNode(true));
    this.#domKnob = shadowRoot.querySelector('knob') as HTMLElement;
    Knob.observedAttributes.forEach((attrName) => {
      this.attributeChangedCallback(attrName);
    });
  }

  static get observedAttributes() {
    return [
      Attributes.disabled,
      Attributes.min,
      Attributes.max,
      Attributes.degree,
    ];
  }

  attributeChangedCallback(attrName: string) {
    switch (attrName) {
      default:
        break;

      case Attributes.disabled:
        this.disabled = this.hasAttribute(Attributes.disabled);
        break;

      case Attributes.min:
        this.min = Number(
          this.getAttribute(Attributes.min)
          ?? -Infinity,
        );
        this.degree = Math.max(this.min, this.degree);
        break;

      case Attributes.max:
        this.max = Number(
          this.getAttribute(Attributes.max)
          ?? Infinity,
        );
        this.degree = Math.min(this.max, this.degree);
        break;

      case Attributes.degree:
        this.degree = Number(
          this.getAttribute(Attributes.degree)
          ?? 0,
        );
        break;
    }
  }

  /**
   * Returns true if Knob is disabled.
   */
  get disabled(): boolean {
    return this.#disabled;
  }

  /**
   * Sets Knob disabled.
   */
  set disabled(value: boolean) {
    const disabled = Boolean(value);

    if (disabled) {
      removeSpinListeners(this);
    } else {
      addSpinListeners(this);
    }

    this.#disabled = disabled;
  }

  /**
   * Returns min degree.
   */
  get min(): number {
    return this.#minDegree;
  }

  /**
   * Sets min degree.
   */
  set min(minDegree: number) {
    if (isNaN(minDegree)) {
      throw new TypeError(`Invalid min degree: ${minDegree}`);
    }

    this.#minDegree = minDegree;

    if (this.max < minDegree) {
      throw new RangeError(
        `Setting min degree that is greater than max degree might cause spinning error: ${minDegree} > ${this.max}`,
      );
    }
  }

  /**
   * Returns max degree.
   */
  get max(): number {
    return this.#maxDegree;
  }

  /**
   * Sets max degree.
   */
  set max(maxDegree: number) {
    if (isNaN(maxDegree)) {
      throw new TypeError(`Invalid max degree: ${maxDegree}`);
    }

    this.#maxDegree = maxDegree;

    if (this.min > maxDegree) {
      throw new RangeError(
        `Setting max degree that is less than min degree might cause spinning error: ${maxDegree} < ${this.min}`,
      );
    }
  }

  /**
   * Returns degree.
   */
  get degree(): number {
    return this.#degree;
  }

  /**
   * Sets degree.
   */
  set degree(value: number) {
    const {
      degree: lastDegree,
    } = this;

    if (value === lastDegree) {
      return;
    }
    if (isNaN(value)) {
      throw new TypeError(`Invalid degree: ${value}`);
    }

    const degree = Math.max(
      Math.min(value, this.max),
      this.min,
    );

    this.#domKnob.style.setProperty('--degree', `${degree}deg`);
    this.#degree = degree;
    triggerEvent<SpinEventDetail>(this, Events.change, {
      bubbles: false,
      cancelable: false,
      detail: {
        degree,
        lastDegree,
        offsetDegree: degree - lastDegree,
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
