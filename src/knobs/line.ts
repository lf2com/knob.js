import KnobBase from './basic';
import registerElement from '../utils/registerElement';

const nodeName = 'knob-line';
const template = document.createElement('template');

template.innerHTML = `
  <style>
    slot[name=pointer] {
      width: 3%;
      height: 15%;
      background: currentColor;
    }
  </style>
`;

class KnobLine extends KnobBase {
  constructor() {
    super();

    (this.shadowRoot as ShadowRoot)
      .append(template.content.cloneNode(true));
  }
}

registerElement(KnobLine, nodeName);

export default KnobLine;
