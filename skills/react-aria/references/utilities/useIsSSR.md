# use

IsSSR

Returns whether the component is currently being server side rendered or
hydrated on the client. Can be used to delay browser-specific rendering
until after hydration.

## Introduction

`useIsSSR` returns `true` during server rendering and hydration, and updates to `false`
immediately after hydration. This can be used to ensure that the server rendered HTML
and initially hydrated DOM match, but trigger an additional render after hydration to
run browser-specific code. For example, it could be used to run media queries or feature
detection for browser-specific APIs that affect rendering but cannot be run server side.

In React 16 and 17, this hook must be used in combination with the [SSRProvider](SSRProvider.md) component
wrapping your application.

## Example

```tsx
import {useIsSSR} from 'react-aria';

function MyComponent() {
  let isSSR = useIsSSR();
  return <span>{isSSR ? 'Server' : 'Client'}</span>;
}
```

## A

PI

<FunctionAPI
  function={docs.exports.useIsSSR}
  links={docs.links}
/>
