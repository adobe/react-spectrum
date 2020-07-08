# @react-aria/aria-modal-polyfill

This package is part of [react-spectrum](https://github.com/adobe-private/react-spectrum-v3).
Certain browser + screen reader combinations do not implement aria-modal correctly, allowing users to navigate outside of the modal.
This package watches a container for aria-modal nodes and hides the rest of the dom from screen readers when one is open use the [aria-hidden](https://www.npmjs.com/package/aria-hidden) package.

## How to use
Include this once in your application at the top level before modals are rendered.
```
import {watchModals} from '@react-aria/aria-modal-polyfill';
watchModals();
```

You can also pass it a selector string, by default it will watch body, which is where most applications should have their provider.

```
watchModals('.my-modal-root');
```
