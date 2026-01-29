# Portal

Provider

Sets the portal container for all overlay elements rendered by its children.

## Introduction

`UNSAFE_PortalProvider` is a utility wrapper component that can be used to set where components like
Modals, Popovers, Toasts, and Tooltips will portal their overlay element to. This is typically used when
your app is already portalling other elements to a location other than the `document.body` and thus requires
your React Aria components to send their overlays to the same container.

<InlineAlert variant="notice">
  <Heading>Safety</Heading>
  <Content>`UNSAFE_PortalProvider` is considered `UNSAFE`. Some portal locations may not work with styling, accessibility,
  or for a variety of other reasons. Typically, it is best to portal to the root of the entire application, e.g. the `body` element,
  outside any possible overflow or stacking contexts. `UNSAFE_PortalProvider` can be used to group all of the portalled
  elements into a single container at the root of the app or to control the order of children of the `body` element.</Content>
</InlineAlert>

## Example

The example below shows how you can use `UNSAFE_PortalProvider` to portal your Toasts to an arbitrary container. Note that
the Toast in this example is taken directly from the [React Aria Components Toast documentation](Toast.md), please visit that page for
a detailed explanation of its implementation.

```tsx
'use client';
import React from 'react';
import {Button} from 'vanilla-starter/Button';
import {MyToastRegion} from './MyToastRegion'
import {UNSAFE_PortalProvider} from '@react-aria/overlays';
import {UNSTABLE_ToastQueue as ToastQueue} from 'react-aria-components';

// Define the type for your toast content.
interface MyToastContent {
  title: string,
  description?: string
}

// Create a global ToastQueue.
const queue = new ToastQueue<MyToastContent>();

// See the above Toast docs link for the ToastRegion implementation
function App() {
  let container = React.useRef(null);
  return (
    <>
      <UNSAFE_PortalProvider getContainer={() => container.current}>
        <MyToastRegion queue={queue} />
        <Button
          onPress={() => queue.add({
            title: 'Toast complete!',
            description: 'Great success.'
          })}>
          Open Toast
        </Button>
      </UNSAFE_PortalProvider>
      <div ref={container} style={{height: '110px', width: '200px',  overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '5px'}}>
        Toasts are portalled here!
      </div>
    </>
  );
}

<App />
```

```css
.react-aria-ToastRegion {
  position: unset;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  border-radius: 8px;
  outline: none;

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }
}

.react-aria-Toast {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--highlight-background);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  outline: none;

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }

  .react-aria-ToastContent {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0px;

    [slot=title] {
      font-weight: bold;
    }
  }

  .react-aria-Button[slot=close] {
    flex: 0 0 auto;
    background: none;
    border: none;
    appearance: none;
    border-radius: 50%;
    height: 32px;
    width: 32px;
    font-size: 16px;
    border: 1px solid var(--highlight-foreground);
    color: white;
    padding: 0;
    outline: none;

    &[data-focus-visible] {
      box-shadow: 0 0 0 2px var(--highlight-background), 0 0 0 4px var(--highlight-foreground);
    }

    &[data-pressed] {
      background: var(--highlight-pressed);
    }
  }
}

```

## Contexts

The `getContainer` set by the nearest PortalProvider can be accessed by calling `useUNSAFE_PortalContext`. This can be
used by custom overlay components to ensure that they are also being consistently portalled throughout your app.

<FunctionAPI
  links={docs.links}
  function={docs.exports.useUNSAFE_PortalContext}
/>

```tsx
import {useUNSAFE_PortalContext} from '@react-aria/overlays';

function MyOverlay(props) {
  let {children} = props;
  let {getContainer} = useUNSAFE_PortalContext();
  return ReactDOM.createPortal(children, getContainer());
}
```

## A

PI

### Portal

Provider
