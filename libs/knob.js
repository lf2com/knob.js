'use strict';

import { isset, isarray, iselem, tostr, isnum, objForEach, tobool } from './stdlib';
import EventHandler from './event-handler';

const EVENT = {
  mouseDown: ['mousedown', 'touchstart'],
  mouseMove: ['mousemove', 'touchmove'],
  mouseUp: ['mouseup', 'touchend'],
  knobStart: ['spinstart', 'start'],
  knobEnd: ['spinend', 'end'],
  knobSpin: ['spinning', 'change'],
};

const getEventXY = ({ clientX, clientY, touches: [{ clientX: x = clientX, clientY: y = clientY } = {}] = []}) => ({ x, y });
const bindEventNames = (self, ...names) => {
  const { [KNOB_PROPS.id]: id } = self;
  return names.reduce((arr, name) => (isarray(name)
    ?arr.concat(bindEventNames(self, ...name))
    :arr.concat(name.split(' ').map((name) => `${name}.${id}`))
  ), []);
};
const stdDeg = (d) => (d<0 ?stdDeg(d+360) :(360<=d ?stdDeg(d-360) :d));
const posToDeg = (p, c = { x: 0, y: 0 }) => {
  const diffX = (p.x-c.x);
  const diffY = (p.y-c.y);
  const len = Math.hypot(diffX, diffY);
  let rad = (diffX/len);
  if (p.y < c.y) {
    if (p.x < c.x) rad = (Math.PI+Math.acos(diffY/len)); // 4
    else rad = Math.asin(diffX/len); // 1
  } else if (p.x < c.x) rad = (Math.PI+Math.asin(-diffX/len)); // 3
  else rad = Math.acos(-diffY/len); // 2
  return stdDeg(180*rad/Math.PI);
};

const KNOB_PROPS = {
  id: '_id',
  dom: '_dom',
  eventHandler: '_eventHandler',
  minDeg: '_minDeg',
  maxDeg: '_maxDeg',
  fixed: '_fixed',
  deg: '_deg',
  enabled: '_enabled',
};

const KNOB_DEFAULTS = {
  minDeg: -Infinity,
  maxDeg: Infinity,
  fixed: false,
  deg: 0,
  enabled: false,
};

function Knob(dom, params = {}) {
  if (!this instanceof Knob) {
    return new Knob(...arguments);
  }
  if (!iselem(dom)) {
    throw new Error(`Invalid element: ${tostr(dom)}`);
  }
  Object.defineProperties(this, {
    [KNOB_PROPS.id]: { value: `knob_${Date.now()}${Math.random()}` },
    [KNOB_PROPS.dom]: { value: dom },
    [KNOB_PROPS.eventHandler]: { value: new EventHandler() },
    [KNOB_PROPS.minDeg]: { value: KNOB_DEFAULTS.minDeg, writable: true },
    [KNOB_PROPS.maxDeg]: { value: KNOB_DEFAULTS.maxDeg, writable: true },
    [KNOB_PROPS.fixed]: { value: KNOB_DEFAULTS.fixed, writable: true },
    [KNOB_PROPS.deg]: { value: KNOB_DEFAULTS.deg, writable: true },
    [KNOB_PROPS.enabled]: { value: KNOB_DEFAULTS.enabled, writable: true },
  });
  objForEach(params, (value, prop) => (isset(this[prop])&&this[prop](value)));
  this.enable();
}


['on', 'off'].forEach((prop) => {
  Knob.prototype[prop] = function() {
    this[KNOB_PROPS.eventHandler][prop](...arguments);
    return this;
  };
});


Knob.prototype.reset = function() {
  this[KNOB_PROPS.deg] = KNOB_DEFAULTS.deg;
  this[KNOB_PROPS.dom].style.transform = '';
}
Knob.prototype.destroy = function() {
  this.disable();
};

Knob.prototype.disable = function() {
  EventHandler.off(this[KNOB_PROPS.dom], bindEventNames(this, EVENT.mouseDown));
  this[KNOB_PROPS.enabled] = false;
  return this;
};
Knob.prototype.enable = function() {
  if (!this[KNOB_PROPS.enabled]) {
    EventHandler.on(this[KNOB_PROPS.dom], bindEventNames(this, EVENT.mouseDown), (evt) => {
      evt.preventDefault();
      const { top, right, bottom, left } = evt.target.getBoundingClientRect();
      const eventHandler = this[KNOB_PROPS.eventHandler];
      const center = { x: (.5*(right+left)), y: (.5*(top+bottom)) };
      const originDeg = this[KNOB_PROPS.deg];
      let lastFingerPos = getEventXY(evt);
      let lastFingerDeg = posToDeg(lastFingerPos, center);
      EventHandler.on(document, bindEventNames(this, EVENT.mouseMove), (evt) => {
        const { top, right, bottom, left } = evt.target.getBoundingClientRect();
        const center = { x: (.5*(right+left)), y: (.5*(top+bottom)) };
        const fingerPos = getEventXY(evt);
        const fingerDeg = posToDeg(fingerPos, center);
        const diffDeg = ((diff) => (180<Math.abs(diff) ?(diff+(fingerDeg<lastFingerDeg ?360 :-360)) :diff))(fingerDeg-lastFingerDeg);
        const currDeg = setDeg(this, (this[KNOB_PROPS.deg]+diffDeg));
        this[KNOB_PROPS.deg] = currDeg;
        lastFingerPos = fingerPos;
        lastFingerDeg = fingerDeg;
        eventHandler.trigger(EVENT.knobSpin, {
          source: this[KNOB_PROPS.dom],
          fingerDeg,
          offsetDeg: (currDeg-originDeg),
          deg: currDeg,
        });
      });
      EventHandler.on(document, bindEventNames(this, EVENT.mouseUp), () => {
        const deg = this[KNOB_PROPS.deg];
        EventHandler.off(document, bindEventNames(this, EVENT.mouseMove, EVENT.mouseUp));
        eventHandler.trigger(EVENT.knobEnd, {
          source: this[KNOB_PROPS.dom],
          offsetDeg: (deg-originDeg),
          deg,
        });
      });
      eventHandler.trigger(EVENT.knobStart, {
        source: this[KNOB_PROPS.dom],
        fingerDeg: posToDeg(lastFingerPos, center),
        offsetDeg: 0,
        deg: originDeg,
      });
    });
    this[KNOB_PROPS.enabled] = true;
  }
  return this;
};


const setDeg = (self, deg = self[KNOB_PROPS.deg]) => {
  if (!isnum(deg)) {
    throw new Error(`Invalid degree: ${tostr(deg)}`);
  }
  const fixed = self[KNOB_PROPS.fixed];
  if (fixed) {
    return false;
  }
  const dom = self[KNOB_PROPS.dom];
  const minDeg = self[KNOB_PROPS.minDeg];
  const maxDeg = self[KNOB_PROPS.maxDeg];
  deg = Math.min(maxDeg, Math.max(minDeg, deg));
  dom.style.transformOrigin = 'center center';
  dom.style.transform = `rotate(${stdDeg(deg)}deg)`;
  self[KNOB_PROPS.deg] = deg;
  return deg;
};
Knob.prototype.setDeg = function(deg) {
  const lastDeg = this[KNOB_PROPS.deg];
  deg = setDeg(this, deg);
  this[KNOB_PROPS.eventHandler].trigger(EVENT.knobSpin, {
    source: this[KNOB_PROPS.dom],
    offsetDeg: (deg-lastDeg),
    deg,
  });
  return this;
};
Knob.prototype.getDeg = function() {
  return this[KNOB_PROPS.deg];
};
Knob.prototype.deg = function(deg) {
  return (isset(deg) ?this.setDeg(deg) :this.getDeg());
};


Knob.prototype.setMinDeg = function(deg) {
  if (!isset(deg)) {
    deg = -Infinity;
  } else if (!isnum(deg)) {
    throw new Error(`Invalid degree: ${tostr(deg)}`);
  } else if (this[KNOB_PROPS.maxDeg] < deg) {
    throw new Error(`Illegal degree: ${this[KNOB_PROPS.maxDeg]} < ${deg}`);
  }
  this[KNOB_PROPS.minDeg] = deg;
  this.setDeg();
  return this;
};
Knob.prototype.getMinDeg = function() {
  return this[KNOB_PROPS.minDeg];
};
Knob.prototype.minDeg = function(deg) {
  return (isset(deg) ?this.setMinDeg(deg) :this.getMinDeg());
};


Knob.prototype.setMaxDeg = function(deg) {
  if (!isset(deg)) {
    deg = Infinity;
  } else if (!isnum(deg)) {
    throw new Error(`Invalid degree: ${tostr(deg)}`);
  } else if (deg < this[KNOB_PROPS.minDeg]) {
    throw new Error(`Illegal degree: ${deg} < ${this[KNOB_PROPS.minDeg]}`);
  }
  this[KNOB_PROPS.maxDeg] = deg;
  this.setDeg();
  return this;
};
Knob.prototype.getMaxDeg = function() {
  return this[KNOB_PROPS.maxDeg];
};
Knob.prototype.maxDeg = function(deg) {
  return (isset(deg) ?this.setMaxDeg(deg) :this.getMaxDeg());
};


Knob.prototype.setFixed = function(fixed) {
  const dom = this[KNOB_PROPS.dom];
  dom.style.transform = '';
  dom.style.transformOrigin = '';
  this[KNOB_PROPS.fixed] = tobool(fixed);
  setDeg(this);
  return this;
}
Knob.prototype.getFixed = function() {
  return this[KNOB_PROPS.fixed];
};
Knob.prototype.fixed = function(fixed) {
  return (isset(fixed) ?this.setFixed(fixed) :this.getFixed());
};


export default Knob;