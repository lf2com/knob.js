# knob.js

Knob.js is a HTML element for spinning and getting the degree.

---

## Demo

[url-demo-knob]: https://lf2com.github.io/knob.js/demo/knob
[url-demo-cd]: https://lf2com.github.io/knob.js/demo/cd

[Knob][url-demo-knob]

Sets knob with min, max, and degree. Also we can change the size of knob.

[CD][url-demo-cd]

An application of knob with CD styled media player.

## Get Started

```html
<script defer src="https://unpkg.com/@lf2com/knob.js@latest/dist/knob.min.js"></script>
<!-- or -->
<script defer src="https://cdn.jsdelivr.net/gh/lf2com/knob.js@latest/dist/knob.min.js"></script>
```

Use knob in HTML:

```html
<knob-line min="-30" max="120"></knob-line>
```

Or in JavaScript code:

```js
const knob = document.createElement('knob-line');

knob.setAttribute('min', -30);
knob.setAttribute('max', 120);
// or
knob.min = -30;
knob.max = 120;

document.body.append(knob);
```

As knob.js is an element, we can code in jQuery:

```jq
$('<knob-line>')
  .attr({
    min: -30,
    max: 120,
  })
  .appendTo($('body'));
```

Or in React:

```jsx
const Knob = () => (
  <knob-line min="-30" max="120" />
);
```

## Styled Knobs

There are default styled knobs we can use directly without styling knob ourselves.

### Dot Knob

![Dot knob](./demo/knob/knob-dot.gif)

```html
<knob-dot></knob-dot>
```

### Line Knob

![Line knob](./demo/knob/knob-line.gif)

```html
<knob-line></knob-line>
```

### Triangle Knob

![Triangle knob](./demo/knob/knob-triangle.gif)

```html
<knob-triangle></knob-triangle>
```

### Customize Knob

We can customize knob with knob base element:

![Custom knob](./demo/knob/knob-custom.gif)

> :warning: _**When customizing knob we need to append child node to `<knob-base>` and style the child node.**_

```html
<style>
  knob-base > .knob {
    width: 100px;
    height: 80px;
    box-shadow: 0 0 5px #999;
    box-sizing: border-box;
    border-radius: 20%;
    border: 3px solid #ccc;
    display: inline-block;

    /* ensure the knob can receive mouse/touch event */
    background-color: rgba(0, 0, 0, 0);
  }
</style>

<body>
  <knob-base>
    <!-- knob doesn't rotates itself but its children -->
    <span class="knob"></span>
  </knob-base>
</body>
```

## Build

Build flip.js with the command:

```sh
npm run build
```

And get the built file at `./dist/knob.min.js`.

## Properties

Properties for setting knob.

### .disabled

> Type of value: _`boolean`_

Set `true` to disallow spinning the knob.

```html
<!-- disable knob -->
<knob-line disabled></knob-line>
```

```js
// disable knob
knob.disabled = true;
// or
knob.setAttribute('disabled', '');

// check if knob is disabled
if (knob.disabled) {
  console.log('Knob is disabled');
}
```

### .degree

> Type of value: _`number`_
>
> Default: _`0`_ or the bound value within [`.min`](#min) and [`.max`](#max).

Degree of knob.

```html
<!-- set degree -->
<knob-dot degree="30"></knob-dot>
```

```js
// set degree
knob.degree = 30;
// or
knob.setAttribute('degree', 30);

// get degree in number
console.log('degree:', knob.degree);
// or in string
console.log('degree:', knob.getAttribute('degree'));
```

### .value

Alias of [`.degree`](#degree).

```js
// set value
knob.value = 30;

// get value
console.log('value:', knob.value);
```

### .min

> Type of value: _`number`_
>
> Default value: _`-Infinity`_

Minimum degree of knob.

```html
<!-- set min/max -->
<knob-triangle min="-60"></knob-triangle>
```

```js
// set min
knob.min = -60;
// or
knob.setAttribute('min', -60);

// get min in number
console.log('min:', knob.min);
// or in string
console.log('min:', knob.getAttribute('min'));
```

### .max

> Type of value: _`number`_
>
> Default value: _`Infinity`_

Maximum degree of knob.

```html
<!-- set min/max -->
<knob-triangle max="150"></knob-triangle>
```

```js
// set max
knob.max = 150;
// or
knob.setAttribute('max', 150);

// get max in number
console.log('max:', knob.max);
// or in string
console.log('max:', knob.getAttribute('max'));
```

## Events

Events for knob elements:

### change

> **Cancelable: `false`**

Dispatches on change of knob degree.

Values of `event.detail`:

| Name | Type | Description |
| -: | :-: | :- |
| degree | _number_ | Current degree |
| lastDegree | _number_ | Degree before changing |
| offsetDegree | _number_ | Difference degree from `lastDegree` to `degree` |

### spinstart

> **Cancelable: `true`**
>
> Would not able to spin the knob if the event is canceled.

Dispatched on start of spinning.

Values of `event.detail`:

| Name | Type | Description |
| -: | :-: | :- |
| degree | _number_ | Current degree |
| lastDegree | _number_ | Degree of beginning. Should be the same as `degree` |
| offsetDegree | _number_ | Difference degree from `lastDegree` to `degree`. Should be `0` |

### spinning

> **Cancelable: `true`**
>
> Would temporarily keep the knob from spinning if the event is canceled.

Dispatches on the knob is being spinned.

Values of `event.detail`:

| Name | Type | Description |
| -: | :-: | :- |
| degree | _number_ | Current degree |
| lastDegree | _number_ | Degree of last spinning event |
| offsetDegree | _number_ | Difference degree from the degree of beginning to `degree` |

### spinend

> **Cancelable: `false`**

Dispatches on the end of spinning.

Properties of `event.detail` is the same as [spinstart](#spinstart).

## License

[url-license]: https://github.com/lf2com/knob.js/blob/master/LICENSE

Knob.js is [MIT licensed][url-license].
