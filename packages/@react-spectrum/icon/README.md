@react-spectrum/icons

# Icons
React Spectrum is a trusted distributor of A4U icons for easy use in your applications.
We provide 959 Workflow Icons and 45 Colored Workflow Icons. These are an open source set of icons and are the core set that Adobe uses.
To see a list of Icons, please go to the following [link](http://spectrum-css.corp.adobe.com/icons/). We may differ from [Spectrum's icon page](http://opensource.adobe.com/spectrum-css/2.13.0/icons/) in terms of icons we supply.
All Icons are available from the top level of this package.

All icons use default exports, so you are free to rename them as you see fit. Instead, we rely on the path to each icon module. There is a special React Inspector display name case, which is icons with names that start with a number. This is not allowed in React, so they have been prefixed with an underscore.

Both of these are valid:

`import Add from '@spectrum-icons/workflow/Add'`
`import IconAdd from '@spectrum-icons/workflow/Add'`

These will both display `<Add />` in the React Inspector

For a component starting with a numeral:

`import _123 from '@spectrum-icons/workflow/123'`
`import Icon123 from '@spectrum-icons/workflow/123'`

These will both display `<_123 />` in the React Inspector

## How to include custom icons
#### Minimal setup
Because we can't include icons for specific projects or non-open source icons, we also support providing your own icons.
To do this, `import {Icon} from '@react-spectrum/icon';` and use it to wrap your own svg components. To take advantage of scale, our wrapper will pass the prop `scale` to your svg component from the React Spectrum Provider.
```jsx
import CustomSVGComponent from '@a4u/product/custom-icons/CustomSVGComponent';

<Icon><CustomSVGComponent /></Icon>
```
There are additional requirements that the custom icons must adhere to. They must match the size and viewbox of Workflow Icons. If you are an Adobe team, we recommend that you go through A4U to request a project specific set of icons, these can be packaged as an npm dependency for you and will be treated in the same way as the core Workflow Icons we redistribute. Their official site is [https://icons.corp.adobe.com](https://icons.corp.adobe.com) and there are links for creating requests.

#### React Spectrum integration
Note: only works with A4u packaged icons. No guarantees for ones you or your designer package yourselves.
See our [build tools](../../@spectrum-icons/build-tools) to help get your icons integrated into your project working with React Spectrum's [Provider](../provider).
```jsx
import CustomSVGComponent from 'path/to/custom-icons/CustomSVGComponent';

<CustomSVGComponent />
```
