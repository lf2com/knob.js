import KnobBase from './basic';
import registerElement from '../utils/registerElement';

const nodeName = 'knob-triangle';
const template = document.createElement('template');

template.innerHTML = `
  <style>
    slot[name=pointer] {
      transform: rotate(45deg);
      margin-top: 5%;
      width: 10%;
      height: 10%;
      background-image: linear-gradient(
        135deg,
        currentColor 50%,
        transparent 50%
      );
    }
  </style>
`;

class KnobTriangle extends KnobBase {
  constructor() {
    super();

    (this.shadowRoot as ShadowRoot)
      .append(template.content.cloneNode(true));
  }
}

registerElement(KnobTriangle, nodeName);

export default KnobTriangle;
