# knob.js
Knob tells the degree you spin. And let you know the degree of knob starts from center-top and positive value for clockwise.

# Demo
https://lf2com.github.io/knob.js/demo

# Build
Knob.js is written with ES2015. To prevent issues of browser support, it's better to use browserify or babel to convert the code.
Or you can run the script:
```javascript
npm install .
npm run build
```
Which equals to:
```javascript
npm install --save-dev babel-core babel-preset-es2015 babelify browserify uglify-js
browserify knob.js -t [ babelify --presets [ es2015 ] ] | uglifyjs -cm > knob.min.js
```

# Browser
Copy `knob.min.js`
```javascript
<script src="PATH/TO/knob.min.js"></script>
```

# Methods
### Create knob
Knob(DOMelement, parameters)
```javascript
knob(dom, {
  minDegree: -405,
  maxDegree: 480
});
```
| property | type | description |
|-|-|-|
| minDegree | _Number_ | minimum degree |
| maxDegree | _Number_ | maximum degree |
| fixed | _Boolean_ | `true` to prevent knob to be spinned |

### Remove knob
```javascript
knob.off(dom); // remove knob
```

### Set/get minimum degree
```javascript
knob.setMinDegree(dom, -405); // set to -405
knob.setMinDegree(dom); // unset (unlimit)
```

### Set/get maximum degree
```javascript
knob.setMaxDegree(dom, 480); // set to 480
knob.setMaxDegree(dom); // unset (unlimit)
```

### Set/get fixed status
```javascript
knob.setFixed(dom, true); // set to fix
knob.setFixed(dom, false); // unset (unfixed)
knob.setFixed(dom); // unset (unfixed)
```

### Get all knob DOMs
```javascript
knob.doms(); // array of knob DOMs
```

# Events
```javascript
// event for start of spin (mousedown/touchstart)
dom.addEventListener('spinstart', function(evt) {
  console.log(evt.detail); // result (see the following table)
});

// event for spining (mousemove/touchmove)
dom.addEventListener('spining', function(evt) {
  console.log(evt.detail); // result (see the following table)
});

// event for end of spin (mouseup/touchend)
dom.addEventListener('spinend', function(evt) {
  console.log(evt.detail); // result (see the following table)
});
```

| property | type | description |
|-|-|-|
| fingerDegree | _Number_ | degree of finger/mouse position, `undefined` for `spinend` event |
| pinDegree | _Number_ | degree that the center-top moves (0 to 360) |
| realDegree | _Number_ | actual degrees of rotation (`minDegree` to `maxDegree`, or unlimit) |
| minDegree | _Number_ | minimum degree |
| maxDegree | _Number_ | maximum degree |
| fixed | _Boolean_ | `true` to prevent knob to be spinned |
