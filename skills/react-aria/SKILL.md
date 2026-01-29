---
name: react-aria
description: Build accessible UI components with React Aria Components. Use when developers mention React Aria, react-aria-components, accessible components, or need unstyled accessible primitives. Provides documentation for building custom accessible UI with hooks and components.
license: Apache-2.0
compatibility: Requires Node.js and a React project with react-aria-components installed.
metadata:
  author: Adobe
  website: https://react-aria.adobe.com/
---

# React Aria Components

React Aria Components is a library of unstyled, accessible UI components that you can style with any CSS solution. Built on top of React Aria hooks, it provides the accessibility and behavior without prescribing any visual design.

## Documentation Structure

The `references/` directory contains detailed documentation organized as follows:

### Guides
- [Collections](references/guides/collections.md): Many components display a collection of items, and provide functionality such as keyboard navigation
- [Customization](references/guides/customization.md): React Aria is built using a flexible and composable API. Learn how to use contexts and slots to crea
- [Drag and](references/guides/dnd.md): Drop
- [Forms](references/guides/forms.md): Learn how to integrate with HTML forms, validate and submit data, and use React Aria with form libra
- [Framework setup](references/guides/frameworks.md): Learn how to integrate React Aria with your framework.
- [Getting started](references/guides/getting-started.md): How to install React Aria and build your first component.
- [M](references/guides/mcp.md): CP Server
- [Quality](references/guides/quality.md): React Aria is built around three core principles: , , and . Learn how to apply these tools to build 
- [Selection](references/guides/selection.md): Many collection components support selecting items by clicking or tapping them, or by using the keyb
- [Styling](references/guides/styling.md): React Aria does not include any styles by default. Learn how to build custom designs to fit your app

### Components
- [Autocomplete](references/components/Autocomplete.md): An autocomplete allows users to search or filter a list of suggestions.
- [Breadcrumbs](references/components/Breadcrumbs.md): Breadcrumbs display a hierarchy of links to the current page or resource in an a
- [Button](references/components/Button.md): A button allows a user to perform an action, with mouse, touch, and keyboard int
- [Calendar](references/components/Calendar.md): A calendar displays one or more date grids and allows users to select a single d
- [Checkbox](references/components/Checkbox.md): A checkbox allows a user to select multiple items from a list of individual item
- [Checkbox](references/components/CheckboxGroup.md): Group
- [Color](references/components/ColorArea.md): Area
- [Color](references/components/ColorField.md): Field
- [Color](references/components/ColorPicker.md): Picker
- [Color](references/components/ColorSlider.md): Slider
- [Color](references/components/ColorSwatch.md): Swatch
- [Color](references/components/ColorSwatchPicker.md): SwatchPicker
- [Color](references/components/ColorWheel.md): Wheel
- [Combo](references/components/ComboBox.md): Box
- [Date](references/components/DateField.md): Field
- ...and 36 more components in `references/components/`

### Interactions
- [Focus](references/interactions/FocusRing.md): Ring
- [Focus](references/interactions/FocusScope.md): Scope
- [use](references/interactions/useClipboard.md): Clipboard
- [use](references/interactions/useDrag.md): Drag
- [use](references/interactions/useDrop.md): Drop
- [use](references/interactions/useFocus.md): Focus
- [use](references/interactions/useFocusRing.md): FocusRing
- [use](references/interactions/useFocusVisible.md): FocusVisible
- [use](references/interactions/useFocusWithin.md): FocusWithin
- [use](references/interactions/useHover.md): Hover
- ...and 5 more in `references/interactions/`

### Utilities
- [I18n](references/utilities/I18nProvider.md): Provider
- [merge](references/utilities/mergeProps.md): Props
- [Portal](references/utilities/PortalProvider.md): Provider
- [S](references/utilities/SSRProvider.md): SRProvider
- [use](references/utilities/useCollator.md): Collator
- [use](references/utilities/useDateFormatter.md): DateFormatter
- [use](references/utilities/useField.md): Field
- [use](references/utilities/useFilter.md): Filter
- [use](references/utilities/useId.md): Id
- [use](references/utilities/useIsSSR.md): IsSSR
- ...and 5 more in `references/utilities/`

### Internationalization
- [Calendar](references/internationalized/date/Calendar.md)
- [Calendar](references/internationalized/date/CalendarDate.md)
- [Calendar](references/internationalized/date/CalendarDateTime.md)
- [Date](references/internationalized/date/DateFormatter.md)
- [Internationalized](references/internationalized/date/index.md)
- [Internationalized](references/internationalized/number/index.md)
- [Number](references/internationalized/number/NumberFormatter.md)
- [Number](references/internationalized/number/NumberParser.md)
- [Time](references/internationalized/date/Time.md)
- [Zoned](references/internationalized/date/ZonedDateTime.md)

### Testing
- [Testing](references/testing/CheckboxGroup/testing.md)
- [Testing](references/testing/ComboBox/testing.md)
- [Testing](references/testing/GridList/testing.md)
- [Testing](references/testing/ListBox/testing.md)
- [Testing](references/testing/Menu/testing.md)
