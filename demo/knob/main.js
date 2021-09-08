(() => {
  const domDeg = document.getElementById('degree').querySelector('input[type=number]');
  const domMin = document.getElementById('min');
  const domMax = document.getElementById('max');
  const domStyle = document.getElementById('style');
  const domMinCheck = domMin.querySelector('input[type=checkbox]');
  const domMaxCheck = domMax.querySelector('input[type=checkbox]');
  const domMinValue = domMin.querySelector('input[type=number]');
  const domMaxValue = domMax.querySelector('input[type=number]');

  /**
   * Returns knob element.
   */
  function initKnob(dom) {
    // displays knob degree
    dom.addEventListener('change', function onChange() {
      domDeg.value = this.degree; // or this.value
    });

    return dom;
  }

  let domKnob = initKnob(document.getElementById('knob'));

  // changes knob degree
  domDeg.addEventListener('input', function onInput() {
    domKnob.degree = this.value; // or this.value
  });

  // toggles of limiting the minimum degree of knob
  domMinCheck.addEventListener('change', function onChange(event) {
    event.stopPropagation();

    if (this.checked) {
      domKnob.setAttribute('min', domMinValue.value);
    } else {
      domKnob.removeAttribute('min');
    }
  });

  // changes the minimum degree of knob
  domMinValue.addEventListener('input', function onInput() {
    if (domMinCheck.checked) {
      domKnob.setAttribute('min', this.value);
    }
  });

  // toggles of limiting the maximum degree of knob
  domMaxCheck.addEventListener('change', function onChange(event) {
    event.stopPropagation();

    if (this.checked) {
      domKnob.setAttribute('max', domMaxValue.value);
    } else {
      domKnob.removeAttribute('max');
    }
  });

  // changes the maximum degree of knob
  domMaxValue.addEventListener('input', function onInput() {
    if (domMaxCheck.checked) {
      domKnob.setAttribute('max', this.value);
    }
  });

  // changes the style of knob
  domStyle.querySelectorAll('input[type=radio]')
    .forEach((dom) => {
      dom.addEventListener('change', function onChange() {
        const domNewKnob = document.createElement(`knob-${this.value}`);

        ['id', 'min', 'max', 'size'].forEach((attrName) => {
          const value = domKnob.getAttribute(attrName);

          if (value !== null) {
            domNewKnob.setAttribute(attrName, value);
          }
        });

        domNewKnob.degree = domKnob.degree;
        domKnob.replaceWith(domNewKnob);
        domKnob = initKnob(domNewKnob);
      });
    });

  // initializes pickuped style
  domStyle.querySelector(`input[value=${
    domKnob.nodeName
      .replace(/^.+-/, '')
      .toLowerCase()
  }]`).setAttribute('checked', '');
})();
