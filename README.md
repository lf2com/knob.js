# knob.js
Knob tells the degree you spin. And let you know the degree of knob starts from center-top and positive value for clockwise.

## Demo

[Spin](https://lf2com.github.io/knob.js/demo/demo_spin.html)

- Custom min/max degrees of spining
- Change current degree
- Toggle the render method of spin for performance judgement

## Install

### Git

```sh
git clone https://github.com/lf2com/knob.js
cd knob.js
npm install .
```

### NodeJS

> **CAUTION: Knob.js is not tested on NodeJS environment. It uses `document` and `eventListener` related functions.**

```sh
npm install @lf2com/knob.js
# or
npm install https://github.com/lf2com/knob.js
```

> **Import**
>
> ```js
> import Knob from '@lf2com/knob.js';
> // Or
> const Knob = require('@lf2com/knob.js');
> ```

### Build

```sh
npm run build
```

> **Debug Build**
>
> ```sh
> npm run build-debug
> ```

### Browser

Download from this repository or use your own built: [**`knob.min.js`**](https://lf2com.github.io/knob.js/knob.min.js)

```html
<!-- include script -->
<script src="PATH/TO/knob.min.js"></script>

<script>
  console.log(window.Knob); // here it is
</script>
```

## Usage

### Create Knob

Create a knob object. Only allow HTML element.

```js
let knob = new Knob(elem);

// or init with parameters
let knob = new Knob(elem, {
  minDeg: 30,
  maxDeg: 330,
});
```

### Reset Knob

Erase changes of knob.

#### .reset()

```js
knob.reset(); // return this
```

### Destroy Knob

Destroy knob object and remove all event listeners on the HTML element.

#### .destroy()

```js
knob.destroy();
```

### Enable/Disable Knob

Enable/disable knob object to listen `mousedown`/`touchstart` event to spin.

#### .enable()

```js
knob.enable(); // return this
```

#### .disable()

```js
knob.disable(); // return this
```

### Degree of Knob

Current degree of knob

#### .deg(deg?)

Get/set degree of knob

```js
knob.deg(30); // set: unit degree, return this
knob.deg(); // get: 30
```

> _Alias_
>
> **.setDeg(deg)**
>
> ```js
> knob.setDeg(30); // set to 30
> ```
>
> **.getDeg()**
>
> ```js
> knob.getDeg(); // get 30
> ```

### Limit Degree of Knob

Limit min/max degree for spining

#### .minDeg(deg?)

> _Default: `-Infinity` (deg)_

#### .maxDeg(deg?)

> _Default: `Infinity` (deg)_

Get/set min/max degree

```js
knob.minDeg(0); // set: unit degree, return this
knob.minDeg(); // get: 0

knob.maxDeg(180); // set: unit degree, return this
knob.maxDeg(); // get: 180
```

> _Alias_
>
> **.setMinDeg(deg)**
>
> **.setMaxDeg(deg)**
>
> ```js
> knob.setMinDeg(0); // set to 0
> knob.setMaxDeg(180); // set to 180
> ```
>
> **.getMinDeg()**
>
> **.getMaxDeg()**
>
> ```js
> knob.getMinDeg(); // get 0
> knob.getMaxDeg(); // get 180
> ```

### Fix Degree of Knob

For better performance, you may want to render the face of knob yourself. In this case, you have to fix the degree of knob then listen the spinning event to render the face of knob.

> **If not fixed, the knob will use CSS transform to rotate the knob to change the degree of knob. [More detail](#Performance)**

#### .fixed(enabled?)

> _Default: `false`_

```js
knob.fixed(true); // set to fix knob
knob.on('spinning', function(evt) {
  let deg = evt.detail.deg;

  // render knob with the new deg
  // ...
});

knob.fixed(); // get true
```

> _Alias_
>
> **.setFixed(enabled)**
>
> ```js
> knob.setFixed(true); // set true
> ```
>
> **.getFixed()**
>
> ```js
> knob.getFixed(); // get true
> ```

## Events of Knob

Knob supports the following events:

| _Name_ | _Description_ | _Alias_ |
| :-: | :- | :-: |
| **spinstart** | Start of spinning | `start` |
| **spinend** | End of spinning | `end` |
| **spinning** | Change of degree _(e.g. spinning, or changing the degree by programing)_ | `change` |

### Arguments of Knob Event

Each event has the following members in the detail of event object:

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **source** | _DOM_ | HTML element of knob |
| **deg** | _Number_ | Degree of rotation |
| **offsetDeg** | _Number_ | Different degree of this time spinning |
| **fingerDeg** _(optional)_ | _Number_ | Mouse/touch degree of knob: _`[0, 360)`_ |

> **CAUTION: `fingerDeg` would not be included for the `spinend` event or if the event is trigger without mouse/touch.**

#### .on(eventNames, functions)

Add event listener

```js
knob.on('spinstart', function(evt) {
  let detail = evt.detail;
  console.log('source', detail.source); // HTML element
  console.log('deg', detail.deg); // degree of knob
  console.log('offset deg', detail.offsetDeg); // different degree of this spinning
  console.log('finger deg', detail.fingerDeg); // mouse/touch position degree
});

knob.on('spinning', function(evt) {
  let detail = evt.detail;
  console.log('source', detail.source); // HTML element
  console.log('deg', detail.deg); // degree of knob
  console.log('offset deg', detail.offsetDeg); // different degree of this spinning
  console.log('finger deg', detail.fingerDeg); // mouse/touch position degree
});

knob.on('spinend', function(evt) {
  let detail = evt.detail;
  console.log('source', detail.source); // HTML element
  console.log('deg', detail.deg); // degree of knob
  console.log('offset deg', detail.offsetDeg); // different degree of this spinning
  // no fingerDeg for the end event
});
```

## Performance

By default, knob uses CSS transform rotate to show the degree of knob. To improve the performance, use canvas to render the face of knob instead:

```js
knob.on('spinning', function(evt) {
  let deg = evt.detail.deg;
  let canvas = your_canvas;
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(deg*Math.PI/180);
  ctx.translate(-canvas.width/2, -canvas.height/2);
  
  // draw something
  // ...

  ctx.restore();
});
```

## License

[MIT](https://github.com/lf2com/knob.js/blob/master/LICENSE) Copyright @ Wan Wan
