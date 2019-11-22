# react-tiny-flip

[![npm version](https://img.shields.io/npm/v/react-tiny-flip)](https://npmjs.com/package/react-tiny-flip)
![](https://img.shields.io/badge/dependencies-zero-green)
![](https://img.shields.io/bundlephobia/min/react-tiny-flip)

`react-tiny-flip` automatically animates changes to its children using the [FLIP technique](https://aerotwist.com/blog/flip-your-animations/) and CSS transitions.

## Basic usage

```jsx
import Flip from "react-tiny-flip";

const SomeComponent = ({ list }) => (
  <Flip>
    {list.map(element => (
      <div key={element}>{element}</div>
    ))}
  </Flip>
);
```

Whenever `list` changes (new elements, removed elements, new order) the change will be animated. `Flip` outputs extra elements in the DOM: a root element and a wrapper element around each child.

## Tradeoffs

There are lots great alternatives to this library out there and I've used many of them. What currently sets `react-tiny-flip` apart from many of these is its size (at ~3kB / ~1kB gzipped). Naturally, you don't get that small size without any tradeoffs. Here are the most notable ones compared to other libraries:

- Interrupts: `react-tiny-flip` doesn't handle interruptions to currently running animations apart from aborting them immediately and starting a new one. This means that if the children passed to `react-tiny-flip` are changed more frequently than the duration of the animation some stuttering will occur.
- Unmounting children: unmounted children disappear immediately without any transition. Siblings of the unmounted children animate as normal.
- Dimensions: `react-tiny-flip` only animates the positions of elements, not dimensions (`height` or `width`)

## API

**children**: `ReactElement[]`

`children` _must_ be a list of react elements (of zero or greater length) and all elements must have a key.

**childElement**: `string = "div"`

The type of html element to wrap around each child.

**childProps**: `object | object[]`

Props to pass on to the child wrapper elements. If an object is used, that object is passed to every child wrapper. If an array is used, child wrapper elements are passed the corresponding object in the list (by index). See example below.

**duration**: `number = 500`

Transition duration in milliseconds.

**easing**: `string = "cubic-bezier(0.3,0,0,1)"`

CSS easing for the transition.

**element**: `string = "div"`

The type of html element to use for the root element.

**elementProps**: `object`

Props to pass on to the root element.

### ChildProps as array

```jsx
import Flip from "react-tiny-flip";

const SomeComponent = ({ list }) => (
  <Flip
    childProps={list.map((element, index) => ({
      className: `${element}-${index}`
    }))}
  >
    {list.map(element => (
      <div key={element}>{element}</div>
    ))}
  </Flip>
);
```
