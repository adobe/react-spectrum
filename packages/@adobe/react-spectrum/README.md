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
| @react-spectrum/actiongroup        | 3.0.0-alpha.1  |
| @react-spectrum/breadcrumbs        | 3.0.0-alpha.1  |
| @react-spectrum/button             | 3.0.0-rc.2     |
| @react-spectrum/buttongroup        | 3.0.0-alpha.1  |
| @react-spectrum/checkbox           | 3.0.0-rc.2     |
| @react-spectrum/dialog             | 3.0.0-alpha.1  |
| @react-spectrum/divider            | 3.0.0-rc.2     |
| @react-spectrum/form               | 3.0.0-rc.2     |
| @react-spectrum/icon               | 3.0.0-rc.2     |
| @react-spectrum/illustratedmessage | 3.0.0-alpha.1  |
| @react-spectrum/image              | 3.0.0-alpha.1  |
| @react-spectrum/label              | 3.0.0-rc.2     |
| @react-spectrum/layout             | 3.0.0-alpha.1  |
| @react-spectrum/link               | 3.0.0-alpha.1  |
| @react-spectrum/listbox            | 3.0.0-alpha.1  |
| @react-spectrum/menu               | 3.0.0-alpha.1  |
| @react-spectrum/meter              | 3.0.0-rc.2     |
| @react-spectrum/overlays           | 3.0.0-alpha.1  |
| @react-spectrum/picker             | 3.0.0-alpha.1  |
| @react-spectrum/progress           | 3.0.0-rc.2     |
| @react-spectrum/provider           | 3.0.0-rc.2     |
| @react-spectrum/radio              | 3.0.0-rc.2     |
| @react-spectrum/searchfield        | 3.0.0-rc.2     |
| @react-spectrum/statuslight        | 3.0.0-rc.2     |
| @react-spectrum/switch             | 3.0.0-rc.2     |
| @react-spectrum/textfield          | 3.0.0-rc.2     |
| @react-spectrum/theme-default      | 3.0.0-rc.2     |
| @react-spectrum/utils              | 3.0.0-rc.2     |
| @react-spectrum/view               | 3.0.0-alpha.1  |
| @react-spectrum/well               | 3.0.0-rc.2     |
