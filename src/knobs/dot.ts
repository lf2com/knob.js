import KnobBase from './basic';
import registerElement from '../utils/registerElement';

const nodeName = 'knob-dot';
const template = document.createElement('template');

template.innerHTML = `
  <style>
    slot[name=pointer] {
      margin-top: 5%;
      border-radius: 50%;
      width: 10%;
      height: 10%;
      background: currentColor;
    }
  </style>
`;

class KnobDot extends KnobBase {
  constructor() {
    super();

    (this.shadowRoot as ShadowRoot)
      .append(template.content.cloneNode(true));
  }
}

registerElement(KnobDot, nodeName);

export default KnobDot;
