import Knob from '../knob';

const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      --size: 80px;
      
      width: var(--size);
      height: var(--size);
    }

    knob {
      position: relative;
      border-radius: 50%;
      box-sizing: border-box;
      border: 1px solid currentColor;
      background: #f3f3f3;
      color: #aaa;
      overflow: hidden;
    }

    knob:hover,
    knob:active {
      color: #888;
      background: #eee;
    }

    cover {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      z-index: 1;
    }

    slot[name=pointer] {
      margin: 0 auto;
      display: block;
    }

    ::slotted([slot=pointer]) {
      display: none;
    }

    knob > slot {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
    }
  </style>
`;

class KnobBase extends Knob {
  constructor() {
    super();

    (this.shadowRoot as ShadowRoot)
      .append(template.content.cloneNode(true));
  }
}

export default KnobBase;
