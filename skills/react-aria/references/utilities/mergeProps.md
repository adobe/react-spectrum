# merge

Props

Merges multiple props objects together. Event handlers are chained,
classNames are combined, and ids are deduplicated.
For all other props, the last prop object overrides all previous ones.

```tsx
import {mergeProps} from '@react-aria/utils';

let a = {
  className: 'foo',
  onKeyDown(e) {
    if (e.key === 'Enter') {
      console.log('enter')
    }
  }
};

let b = {
  className: 'bar',
  onKeyDown(e) {
    if (e.key === ' ') {
      console.log('space')
    }
  }
};

let merged = mergeProps(a, b);
```

The result of the above example will be equivalent to this:

```tsx
let merged = {
  className: 'foo bar',
  onKeyDown(e) {
    a.onKeyDown(e);
    b.onKeyDown(e);
  }
};
```

## A

PI

<FunctionAPI
  function={docs.exports.mergeProps}
  links={docs.links}
/>
