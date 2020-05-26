# @adobe/react-spectrum

This package allows you to easily import any component published under @react-spectrum. Think of it as a helpful alias,
with each component "pinned" to a specific version.

Components are updated sporadically, so if you require a change from a version of a component that is not yet included
in this package, you are able to install the specific version and then update your import statement to use the
component from the @react-spectrum scope. It's worth noting that this may result in increased file size.

## Naming conventions

Any component published under the @react-spectrum scope will be available at the same path from @adobe/react-spectrum.
For example, if you want to use `Checkbox` from @react-spectrum this is what you'd be importing:

```js
import {Checkbox} from '@react-spectrum/checkbox';
```

To import the same component from @adobe/react-spectrum, it would look like this:

```js
import {Checkbox} from '@adode/react-spectrum/checkbox';
```

This convention will be consistent for all packages to make it easy to switch between @react-spectrum and
@adobe/react-spectrum.

## Component versions

| Component                          | Version        |
| ---------------------------------- | -------------- |
| @react-spectrum/actiongroup        | 1.0.0          |
| @react-spectrum/breadcrumbs        | 1.0.0          |
| @react-spectrum/button             | 1.0.0          |
| @react-spectrum/buttongroup        | 1.0.0          |
| @react-spectrum/checkbox           | 1.0.0          |
| @react-spectrum/dialog             | 1.0.0          |
| @react-spectrum/divider            | 1.0.0          |
| @react-spectrum/form               | 1.0.0          |
| @react-spectrum/icon               | 1.0.0          |
| @react-spectrum/illustratedmessage | 1.0.0          |
| @react-spectrum/image              | 1.0.0          |
| @react-spectrum/label              | 1.0.0          |
| @react-spectrum/layout             | 1.0.0          |
| @react-spectrum/link               | 1.0.0          |
| @react-spectrum/listbox            | 1.0.0          |
| @react-spectrum/menu               | 1.0.0          |
| @react-spectrum/meter              | 1.0.0          |
| @react-spectrum/overlays           | 1.0.0          |
| @react-spectrum/picker             | 1.0.0          |
| @react-spectrum/progress           | 1.0.0          |
| @react-spectrum/provider           | 1.0.0          |
| @react-spectrum/radio              | 1.0.0          |
| @react-spectrum/searchfield        | 1.0.0          |
| @react-spectrum/statuslight        | 1.0.0          |
| @react-spectrum/switch             | 1.0.0          |
| @react-spectrum/textfield          | 1.0.0          |
| @react-spectrum/theme-default      | 1.0.0          |
| @react-spectrum/utils              | 1.0.0          |
| @react-spectrum/view               | 1.0.0          |
| @react-spectrum/well               | 1.0.0          |
