(() => { 'use strict';

  const _evtStartName = 'spinstart';
  const _evtEndName = 'spinend';
  const _evtExecName = 'spining';

  const isset = (o) => ('undefined'!==typeof o);
  const fireEvent = (t, n, p) => t.dispatchEvent(new CustomEvent(n, { detail: p }));
  const evtPool = [];
  const doublePi = 2*Math.PI;
  const domForEach = (dom, func) => {
    if (!isset(dom)) { throw new Error('No argument'); }
    if (dom instanceof NodeList || dom instanceof Array) {
      Array.prototype.forEach.call(dom, (d) => domForEach(d, func));
    } else if (!(dom instanceof HTMLElement)) {
      throw new Error('Illegal element', dom);
    }
    func(dom);
  };
  const stdDeg = (d) => {
    while (d < 0) {
      d += 360;
    }
    return d%360;
  };
  const evtPos = (e) => {
    let t = (isset(e.clientX) ?e :e.touches[e.touches.length-1]);
    return {
      x: t.clientX,
      y: t.clientY
    };
  };
  const posDeg = (p, c) => {
    let dx = p.x-c.x;
    let dy = p.y-c.y;
    let l = Math.sqrt(dx*dx+dy*dy);
    let rad = (() => {
      switch (posArea(p, c)) {
        case 1: return Math.asin(dx/l);
        case 2: return Math.PI-Math.asin(dx/l);
        case 3: return Math.PI+Math.asin(-dx/l);
        case 4: return doublePi-Math.asin(-dx/l);
      }
    })();
    return 180*rad/Math.PI;
  };
  const posArea = (p, c) => {
    if (p.x < c.x) {
      return (p.y<c.y ?4 :3);
    } else {
      return (p.y<c.y ?1 :2);
    }
  };
  const degArea = (d) => {
    d = stdDeg(d);
    if (d < 90) return 1;
    else if (d < 180) return 2;
    else if (d < 270) return 3;
    else return 4;
  };
  const areaDirection = (c, l) => {
    switch (Math.abs(c-l)) {
      case 0: return 0;
      case 1: return c-l;
      case 2: return (Math.random()<0.5 ?2 :-2);
      case 3: return (l<c ?-1 :1);
    }
  };
  const directionDeg = (d) => {
    if (d < 0) return 360*(parseInt((d+1)/4)-1);
    else return 360*parseInt(d/4);
  };

  function knob(src, params = {}) {
    domForEach(src, (dom) => {
      knob.setMinDegree(dom, params.minDegree);
      knob.setMaxDegree(dom, params.maxDegree);
      knob.setFixed(dom, params.fixed);
      knob.setDegree(dom, (params.degree||0));
      let onstart = function(evt) {
        evt.preventDefault();
        let rect = this.getBoundingClientRect();
        let center = { x: (0.5*(rect.right+rect.left)), y: (0.5*(rect.top+rect.bottom)) };
        let startDeg = posDeg(evtPos(evt), center);
        let startArea = degArea(startDeg);
        let recordDeg = (this._knobRecordDeg||0);
        let lastDeg = recordDeg;
        let lastArea = degArea(lastDeg);
        let directions = (this._knobRecordDirections||0);
        let lastDirections = directions;
        fireEvent(dom, _evtStartName, {
          fingerDegree: startDeg,
          pinDegree: stdDeg(recordDeg),
          realDegree: recordDeg,
          minDegree: knob.getMinDegree(this),
          maxDegree: knob.getMaxDegree(this),
          fixed: knob.getFixed(this)
        });
        let onknob = (evt) => {
          let currDeg = posDeg(evtPos(evt), center);
          let pinDeg = stdDeg(recordDeg+360+currDeg-startDeg);
          let pinArea = degArea(pinDeg);
          directions += areaDirection(pinArea, lastArea);
          lastArea = pinArea;
          let realDeg = (pinDeg+directionDeg(directions));
          let minDegree = knob.getMinDegree(this);
          let maxDegree = knob.getMaxDegree(this);
          let fixed = knob.getFixed(this);
          if (isset(minDegree) && realDeg < minDegree) {
            realDeg = minDegree;
            pinDeg = stdDeg(realDeg);
            lastDirections = (parseInt(minDegree/90)-1);
          } else if (isset(maxDegree) && maxDegree < realDeg) {
            realDeg = maxDegree;
            pinDeg = stdDeg(realDeg);
            lastDirections = parseInt(maxDegree/90);
          } else {
            lastDirections = directions;
          }
          lastDeg = realDeg;
          if (!fixed) { this.style.transform = ('rotate('+pinDeg+'deg)'); }
          fireEvent(dom, _evtExecName, {
            fingerDegree: currDeg,
            pinDegree: pinDeg,
            realDegree: realDeg,
            minDegree: minDegree,
            maxDegree: maxDegree,
            fixed: fixed
          });
        };
        let onend = (evt) => {
          this._knobRecordDeg = lastDeg;
          this._knobRecordDirections = lastDirections;
          document.removeEventListener('mousemove', onknob);
          document.removeEventListener('touchmove', onknob);
          document.removeEventListener('mouseup', onend);
          document.removeEventListener('touchend', onend);
          fireEvent(dom, _evtEndName, {
            fingerDegree: undefined,
            pinDegree: stdDeg(lastDeg),
            realDegree: lastDeg,
            minDegree: knob.getMinDegree(this),
            maxDegree: knob.getMaxDegree(this),
            fixed: knob.getFixed(this)
          });
        }
        document.addEventListener('mousemove', onknob);
        document.addEventListener('touchmove', onknob);
        document.addEventListener('mouseup', onend);
        document.addEventListener('touchend', onend);
      };
      dom.addEventListener('mousedown', onstart);
      dom.addEventListener('touchstart', onstart);
      evtPool.push({ target: dom, func: onstart });
    });
  }
  knob.off = (src) => domForEach(src, (dom) => {
    for (let i=0; i<evtPool.length; i++) {
      let item = evtPool[i];
      if (item.target === dom) {
        dom.removeEventListener('mousedown', item.func);
        dom.removeEventListener('touchstart', item.func);
        return;
      }
    }
  });
  knob.getFixed = (dom) => dom._knobFixed;
  knob.setFixed = (src, fixed) => domForEach(src, (dom) => { dom._knobFixed = (fixed ?true :false); });
  knob.getMaxDegree = (dom) => dom._knobMaxDegree;
  knob.setMaxDegree = (src, deg) => domForEach(src, (dom) => { dom._knobMaxDegree = deg; });
  knob.getMinDegree = (dom) => dom._knobMinDegree;
  knob.setMinDegree = (src, deg) => domForEach(src, (dom) => { dom._knobMinDegree = deg; });
  knob.getDegree = (dom) => dom._knobRecordDeg;
  knob.setDegree = (src, deg) => domForEach(src, (dom) => {
    let minDegree = dom._knobMinDegree;
    let maxDegree = dom._knobMaxDegree;
    deg = Math.min(maxDegree, Math.max(minDegree, deg));
    dom._knobRecordDeg = deg;
    dom._knobRecordDirections = (parseInt(deg/90)+(0<deg ?0 :-1));
    dom.style.transform = ('rotate('+deg+'deg)');
  });
  knob.doms = () => evtPool.map((item) => item.target);

  module.exports = knob;
  if (self && (self instanceof Object) && (self.self === self)) {
    self.knob = knob;
  }

})();