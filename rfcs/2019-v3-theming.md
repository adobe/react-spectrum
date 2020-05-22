<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2019-05-31
- RFC PR: (leave this empty, to be filled in later)
- Authors: Devon Govett

# React Spectrum v3: Theming

## Summary

React Spectrum has supported the four Spectrum color themes from the beginning, and added support for large and medium scales along the way. As the number of themes, scales, and components in Spectrum continues to grow, CSS build size for applications utilizing React Spectrum is becoming more of an issue. Also, new use cases for custom themes in addition to the default Spectrum themes have arisen. In this RFC, we propose a new architecture for styling in React Spectrum which will include better support for both default and custom themes, while reducing build size and complexity.

## Motivation

### Build Size

Currently by default, React Spectrum includes all themes and scales from Spectrum CSS, which is massive (885 KB for all components). It is possible to only include the themes that are actually used in an application by setting environment variables, but this is hard to configure depending on the build tool. For example, in webpack, you need to use the `DefinePlugin` and set a value for *all* of the theme and scale variables, not just the ones you use. This means that when Spectrum adds a new theme, and React Spectrum adds an environment variable for it, apps will start including it automatically rather than excluding since they do not define the environment variable. In addition, the commonly used create-react-app tool doesn't allow setting environment variables at all, and therefore includes all themes and scales no matter what.

Specifying the themes to include is also very manual - you need to know all of the themes you need to use in your app, including for components you might include from libraries in `node_modules`. It may not be obvious what themes third party code uses, so needing to manually configure the themes to include is not great. We need a solution to reduce build size that doesn’t rely on environment variables or manual configuration.

### CSS Conflicts

CSS selectors are essentially global variables. While this can be quite useful for styling documents, it also makes building self contained reusable components quite challenging. There are three main issues we have run into in react-spectrum.

1. It is impossible to include multiple versions of the same component in an application without the CSS from one version overwriting the CSS for the others. While including multiple versions is problematic for other reasons (e.g. build size), sometimes it is unavoidable, especially with large teams and third party libraries. We need to support this more reliably in React Spectrum.
2. Spectrum CSS class names are private API and should not be relied on by applications. Component DOM structure and CSS classes have changed over time in React Spectrum as we add new features and update components when the design evolves. Applications that target and override styles using Spectrum CSS class names can easily break, even though this use is unsupported and discouraged in the documentation. This has a high support cost for the React Spectrum and Spectrum CSS teams, which need to ensure that unknown overrides in applications continue to work over time. We need a way for applications to provide their own custom class names to each component in order to override things in a more reliable and maintainable way.
3. It is currently not possible to reliably nest themes, for example to have a dark themed section inside a normally light themed application. This is due to the way descendant selectors work in CSS. At most only two nested themes can be used, and this relies on the order they are imported in the built CSS, which can be hard to control. We need a way for applications to nest themes reliably in React Spectrum.

### Theme Customization

As the number of teams using React Spectrum has grown, new use cases have come up for us to support. One of those is support for custom themes. This requirement comes from products like Magento and AEM, which allow customers to build their own themes to match their brand.

In addition, customizable themes could have a huge impact for external users of React Spectrum once it is open source. As an industry, we are rebuilding the same components over and over again with mostly the same interactions at every company, just to implement a unique design. It should be much easier to build a component library for a design system with proper support for accessibility, internationalization, and more without reimplementing all of those features from scratch. Since we’ve invested heavily into making our component library full featured, React Spectrum could serve as a great starting point for other design systems.


## Detailed Design

### Native CSS Variables

[CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) are now supported across all modern browsers. IE11 is the only browser we currently support that does not support them, and it is possible to [polyfill](https://github.com/aaronbarker/css-variables-polyfill) (limited) support there. Using native CSS variables will reduce the build size of the CSS in React Spectrum applications tremendously. Rather than duplicating the rules for every single theme and scale across each component, the CSS only needs to be included once since the variables will be substituted by the browser at runtime.

However, even the variable files exported by DNA are quite large. They currently include 2,573 variables per theme, and 4,630 variables per scale. Most of these variables are just aliasing other spectrum global variables though, so we can reduce this considerably. When only unique variables by value are included, only 72 variables per theme and 79 variables per scale are required. This makes it feasible to include the variables needed for all themes, and just swap class names on the `Provider` to switch between them. This will also allow us to get rid of the environment variables we currently have to choose which themes to include in the build.

CSS variables also solve our issues with nested themes. Since variables are inherited by child elements, all variables defined at the provider level are applied in child elements. If there is a sub-provider, it will redefine the values for all variables, and children of it will get the nested theme. This allows infinite nesting of themes, without requiring they be built in a specific order.

### CSS Modules

In order to stop relying on global class names from Spectrum CSS, we can use [CSS Modules](https://github.com/css-modules/css-modules). This will make the CSS class names unique per build, which will solve our issues with multiple versions of the CSS, and application overrides. Since the class names are unique per file and per build, if there are multiple versions of a component, they will get different class names rather than the original Spectrum CSS class names, and therefore will not conflict. Also, since the classes are hashed, they cannot be predicted and relied on by applications. Applications will need to provide their own custom class names to components in order to perform any overrides they need to do.

CSS modules work by importing the actual class names to use in JavaScript. The compiler transforms the class names from the original CSS to be unique, and exports a mapping from original class names to unique class names for the JavaScript component. Then, instead of using hard coded class strings, the component uses the mapping. This allows the class names to be unique per build without requiring components to be updated every time the CSS changes.

```jsx
import styles from '@adobe/spectrum-css/dist/components/button/vars.css';

function Button(props) {
  // ...
  return (
    <button className={styles['spectrum-Button']}>
      {props.children}
    </button>
  );
}
```

In order to prevent applications from needing to configure support for CSS modules in their build systems, we will precompile CSS modules in the build of react-spectrum. The output bundle for each component will include CSS that is pre-compiled to use hashed class names rather than the original spectrum class names, and will include the map from spectrum class names to hashed class names prebuilt in the JavaScript.

### Custom Themes

Because Spectrum CSS is built using variables, it is relatively easy to build custom themes. You just need to define values for all variables, or at least the global set that everything maps to, and you have a new theme. To apply a theme, a class name needs to be added by the React Spectrum provider.

There are three “layers” of custom theming that might be needed for different use-cases:


1. **Global color palette customization** — in its simplest form, a theme consists of variable definitions for all global colors in the color palette. These variables propagate to all components automatically, via the definitions already present in Spectrum DNA. Spectrum design has a tool called [Leonardo](https://git.corp.adobe.com/pages/Spectrum/leonardo/index.html) which can be used to generate accessible color palettes. Additional tooling could be developed to help users build custom color palettes and visualize the results on components in realtime.
2. **Component customization** — building on a customizable global color palette, this layer allows customizing individual component variables. For example, Coca Cola might want to change the CTA button background to be red instead of blue. This can be accomplished using CSS variable fallback. The CSS for each component can be built such that it refers to the original variable name in addition to the mapped unique global variable name. This way, a minimal build of unique variables can be included in a theme by default, but custom themes can override individual component variables as needed.
3. **Custom DOM structure or behavior** — for very advanced use cases, sometimes it is necessary to change the DOM structure or CSS classes of a component in order to implement the desired visual style. For example, if a new visual state is needed, custom logic to enable/disable that state would be needed, along with potentially new CSS classes applied to various elements in the component. To implement this, the component rendering would need to be overridden. However, much of the behavior, accessibility, etc. could be reused using the hooks defined in the [architecture RFC](https://github.com/adobe/react-spectrum/blob/master/rfcs/2019-v3-architecture.md).

All together, a theme definition could look like the following. It must define values for all of the spectrum global variables at a minimum, but can additionally define overrides for individual component variables as well.

```css
.coca-cola-theme {
  // definitions for all spectrum global theme variables
  --spectrum-global-color-gray-100: rgb(255, 255, 255);
  --spectrum-global-color-gray-200: rgb(244, 244, 244);
  --spectrum-global-color-gray-300: rgb(234, 234, 234);
  // ...

  // definitions for individual component overrides
  --spectrum-button-background-color: red;
}
```

The definition for a component when built in Spectrum CSS looks like the following. It uses CSS variable fallback to apply the overridden value for the original variable name if available, falling back to the mapped global variable by default. This keeps themes minimal by default since only the 72 unique global variables are required, but allows granular customization of individual variables.

```css
.spectrum-Button {
  background: var(
    --spectrum-button-background-color,   // original
    var(--spectrum-global-color-gray-100) // fallback
  );
}
```

Applying a theme is done using the `Provider` component. Applications directly import the themes and scales they wish to use as CSS modules, and pass them to the `Provider` component as props. `Provider` applies the root class name from the modules to a div, which declares all of the variables for the theme and scale on that div. Everything inside that provider will inherit the values for the variables defined for the theme and scale.

```jsx
import dark from '@adobe/spectrum-css/dist/vars/spectrum-dark-unique.css';
import medium from '@adobe/spectrum-css/dist/vars/spectrum-medium-unique.css';
import {Provider} from '@react-spectrum/provider';

function App() {
  return (
    <Provider theme={dark} scale={medium}>
      {/* YOUR APP HERE */}
    </Provider>
  );
}
```

One thing to consider is that react-spectrum v3 supports multiple versions of a component in a single app simultaneously. This means that a new version of a component could potentially use a new variable that does not exist in the version of provider that is used. This could be mitigated by throwing an error if an app used a major version of provider less than the major version of a component. We will still need to be careful about not removing variables, however, to ensure that upgrading provider does not break older versions of components inside it.

### Custom Class Names

In order to allow one-off customization of components in applications without relying on Spectrum CSS class names, we need to allow passing custom class names to all React Spectrum components. This is mostly supported today by the `className` property, which combines the default Spectrum CSS class name with the user provided ones. However, there is currently no way to customize a sub-element of a React Spectrum component without relying on Spectrum CSS class names. For example, one may wish to customize the styling of the menu inside a dropdown.

In order to support child element customization, many components will have a `childElementProps` prop. This will be a mapping of child element names (e.g. `menu`) to custom DOM props to apply, including `className` and others. This will allow custom styling, attributes for testing (e.g. `data-test-id`), and whatever other types of DOM customizations might be necessary for applications.

```jsx
<SplitButton
  {/* ... */}
  childElementProps={{
    menu: {
      className: 'my-custom-class-name',
      'data-test-id': 'my-split-button-menu'
    }
  }} />
```

### Short-term Backward Compatibility

We realize that many applications are currently relying on global spectrum-prefixed class names in their applications in order to customize styles. This will break when upgrading to React Spectrum v3 since the Spectrum CSS class names will be replaced by unique CSS module class names.

In order to assist applications with the upgrade process, we will support an opt-in flag to the `Provider` component to retain the original Spectrum CSS class names in addition to the CSS module class names. The CSS module classes will be what actually apply the default styling, but any overrides that were targeting Spectrum CSS class names will continue to work. Enabling this will come with a console warning recommending applications turn off the flag and replace their overrides with custom class names of their own.

```jsx
<Provider UNSAFE_keepSpectrumClassNames={true}>
  {/* ... */}
</Provider>
```

## Documentation

This is a pretty big change to the way React Spectrum is implemented, and has downstream effects for applications consuming it. Detailed documentation on how to migrate to React Spectrum v3 will be important. 

- The documentation on how to use `Provider` to specify what themes to include will need to be updated to refer to CSS modules instead of using string theme names.
- Documentation on how to convert an existing app from using environment variables to specify what themes to include to using CSS module imports should be written for the v3 migration guide.
- Documentation on how to provide custom class names to components will be needed, including the `className` prop as well as `childElementProps`.
- The `UNSAFE_keepSpectrumClassNames` prop on `Provider` for backward compatibility should be documented in the migration guide for v3.
- Documentation on how to build custom themes using React Spectrum v3 should be written.

## Drawbacks

There are very strong reasons to migrate to CSS modules and CSS variables, but there are some drawbacks too.

- **Browser support** — IE 11 is the only browser we currently support that does not support native CSS variables. We would like to encourage product teams to drop support for IE 11, so we will not support it in React Spectrum out of the box. However, we do recognize that some products may not be able to drop IE 11 immediately. For those teams, we will provide documentation on how to include polyfills and the necessary build configuration to support IE 11 in their apps.
- **Backward compatibility** — Some applications currently rely on Spectrum CSS global class names for customizations, which will be broken by CSS modules in React Spectrum v3. We will provide an opt-in backward compatibility flag for those applications in order to prevent breakages while they transition to custom class names of their own.

## Backwards Compatibility Analysis

This is a breaking change. This section is mostly covered by the drawbacks section above. In particular, Spectrum CSS global class names that applications may currently depend on will be going away by default, as will support for IE 11.

## Alternatives

We considered many alternative designs, which all had various downsides.

- **CSS-in-JS** — writing CSS in JavaScript is pretty popular these days, especially in the React community. Doing so allows variables to be injected into components using context, which enables theming. This approach is mostly a non-starter for us though, as it would involve rewriting Spectrum CSS, which would then not be useful for other non-React implementations of Spectrum.
- **Dynamic Imports** — importing CSS files dynamically based on the theme was also considered, but ruled out because it would still require manual configuration of which themes to build for an application, rather than being declared in the code, and would also require CSS to be loaded asynchronously.
- **Aliases** — build-time aliases were considered, in order to replace CSS imports with a different one based on the theme. This also required manual configuration, and additionally only allowed a single theme per application, which is a requirement for several applications.
- **Environment variables** — our current solution for including themes was ruled out because it required manual configuration that is brittle over time as new themes are added.
- **Wrapper components** — creating specific versions of each component for each theme was considered, e.g. `<SpectrumDarkButton>`. This was determined to be much harder to use, and also made it impossible to change themes at runtime efficiently.
