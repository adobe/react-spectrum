- Start Date: 2019-11-20
- RFC PR: (leave this empty, to be filled in later)
- Authors: Devon Govett

# React Spectrum v3 DOM Props and Custom Styling

## Summary

React Spectrum exposes its underlying DOM nodes in various ways: through refs, DOM props (e.g. events), and custom class names. This results in the potential for unintended breaking changes when DOM structure or CSS styling changes. In addition, cross platform requirements (e.g. UXP) may cause differences in DOM structure with unintended side effects for shared code. This RFC proposes being more intentional about which DOM props and custom styles are supported in each component to ensure they work consistently across platforms and over time.

## Motivation

Currently in React Spectrum, we pass through all DOM props to (usually) the top-most node in a component using `filterDOMProps`. This includes custom class names for styling, events, data attributes, aria props, etc.

While this is quite flexible, it has a few issues:

1. It's too hard to support consistently over time without breaking changes. If the internal DOM structure for a component changes, props that were being sent to one element might be moved to a different one. In addition, custom styling might break due to CSS changes, etc.
2. It's hard to support cross platform. For example, UXP sometimes renders the same components using different elements. When sharing code between web and native, this becomes problematic.
3. It's easy to send DOM props to the wrong elements, or unintentionally pass props through that should not be on a particular element. We've seen this many times in v2.

## Detailed Design

The solution is to be very intentional about which props are supported on which components, and where they are passed. The general rules are as follows.

* Only DOM props that make sense for each component are supported. There is a much smaller set of default supported DOM props for all components (just 9 props).
* DOM props are passed to the element that makes the most sense - the one that is least likely to change. Most of the time this is the outer most one, but sometimes a wrapper could exist (e.g. Textfield props go to the inner `<input>` element).
* Custom `className` and `style` are unsupported (see below).
* Refs should not forward directly to a DOM element, but should expose an explicitly documented and supported interface.

### Styling

The main question is what to do about custom styling. Custom `className` is too powerful. It allows users to override literally anything about a component's style. These overrides could easily break with future updates to CSS, or the DOM structure of a component. It's also easy to write styles that don't work cross platform (e.g. web and native UXP).

What we really want is to allow a subset of "safe" style settings, and disallow unsafe overrides. In addition, these overrides should ideally be using defined Spectrum DNA variables, and not custom pixel/color values. This should reduce the risk of unintended UI breakages in the future.

So, what would the set of "safe" styles include? Generally, it's layout related options that affect things outside the component, but not internally. For example, margins (but not padding), width, height, flex related props, etc. Styles that should not be customized include colors (other than spectrum-defined variants), text styles, backgrounds, borders, etc., which have been intentionally chosen by Spectrum design with Adobe branding, accessibility and UX guidelines in mind.

This can be enabled by supporting explicit props for styling in the API for each component. The values should mostly consist of Spectrum DNA variables rather than custom values. The solution in this PR is a set of style props that can be applied, like the following:

```jsx
<Button margin="size-250">A button</Button>
```

The full list of supported style props can be seen [here](https://github.com/adobe-private/react-spectrum-v3/blob/db1b2716cbe934323866a8bb5391284e0659e569/packages/%40react-spectrum/view/src/types.ts#L4).

Applications may also need to take advantage of Spectrum DNA variables for custom UI components, e.g. layout containers. This could be provided in the form of a `<View>` component that would be used in place of `<div>` or `<span>`. It would add some additional props for backgrounds, borders, paddings, etc. using Spectrum defined variables for the values. A start at this is also included in the PR.

```jsx
<View
  backgroundColor="negative"
  width="single-line-width"
  height="size-500"
  elementType="span" />
```

Because this is a drastic change from the way applications have previously been written, and because it is intentionally limited, there is an escape hatch. `className` still exists but is renamed to `UNSAFE_className` to be clear that it is possibly breaking out of the confines of Spectrum design and could break in a future update if DOM structure or Spectrum CSS changes. `UNSAFE_style` is supported in the same way for inline styles instead of `style`.

This should be implemented by generating TypeScript definitions for style property values from DNA variables, and mapping them to variables at runtime. We could use inline `style` attributes or support build tools to extract this into a separate CSS file for production.

### Events

Events should be intentially supported by individual components rather than always passed through to the top-level element. Ideally, they should use our interactions packages to handle cross-device events like press instead of specific events like mouse and touch events. Events should be bound to the element that makes the most sense for its purpose. For example, events would be bound to the `<input>` element of a TextField component rather than the wrapper div.

### Refs

The React team [advises](https://reactjs.org/docs/refs-and-the-dom.html#exposing-dom-refs-to-parent-components) against exposing direct refs to DOM nodes. Rather than forwarding refs to the top-level DOM node, we should expose an interface that's specific to each component. For example, for a TextField we could have `focus()` and `select()` methods. As an escape hatch, if we need to allow access to the actual DOM node, we could support an `UNSAFE_getDOMNode()` method or similar.

## Documentation

* We will need to document how to add custom styles to our components clearly on the website.
* We should include warnings for `className` and `style` in the code during development with links to this documentation so users can learn about the new way of styling.
* DOM props, events, and refs that are supported should be part of the documentation for each component.

## Drawbacks

* This is a big change to how applications have traditionally been written.
* It is intentionally limited, so it may require users that want to do custom things to talk to us about their requirements (hopefully), or build their own versions of a component (hopefully not).

## Backwards Compatibility Analysis

This is a breaking change.

## Alternatives

* Style linter?
* CSS in JS libraries?

## Open Questions

* The exact events that should be passsed to each component
* The interface to expose to refs instead of a raw DOM node
