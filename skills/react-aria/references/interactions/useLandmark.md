# use

Landmark

Provides landmark navigation in an application. Call this with a role and label to register a landmark navigable with F6.

```tsx
import {useLandmark} from 'react-aria';
import {useRef} from 'react';

function Navigation(props) {
  let ref = useRef<HTMLElement | null>(null);
  let {landmarkProps} = useLandmark({...props, role: 'navigation'}, ref);
  return (
    <nav ref={ref} {...props} {...landmarkProps}>
      {props.children}
    </nav>
  );
}

function Region(props) {
  let ref = useRef<HTMLElement | null>(null);
  let {landmarkProps} = useLandmark({...props, role: 'region'}, ref);
  return (
    <article ref={ref} {...props} {...landmarkProps}>
      {props.children}
    </article>
  );
}

function Search(props) {
  let ref = useRef<HTMLFormElement | null>(null);
  let {landmarkProps} = useLandmark({...props, role: 'search'}, ref);
  return (
    <form ref={ref} {...props} {...landmarkProps}>
      <h2 id="search-header">Search</h2>
      <input aria-labelledby="search-header" type="search" />
    </form>
  );
}

<div>
  <Navigation>
    <h2>Navigation</h2>
    <ul>
      <li><a href="#">Link 1</a></li>
      <li><a href="#">Link 2</a></li>
    </ul>
  </Navigation>
  <Search />
  <Region aria-label="Example region">
    <h2>Region</h2>
    <p>Example region with no focusable children.</p>
  </Region>
</div>
```

## Features

Landmarks provide a way to designate important subsections of a page. They allow screen reader users to get an overview of the various sections of the page, and jump to a specific section.
By default, browsers do not provide a consistent way to navigate between landmarks using the keyboard.
The `useLandmark` hook enables keyboard navigation between landmarks, and provides a consistent experience across browsers.

* <Keyboard>F6</Keyboard> and <Keyboard>Shift+F6</Keyboard> key navigation between landmarks
* <Keyboard>Alt+F6</Keyboard> key navigation to the main landmark
* Support for navigating nested landmarks

## Anatomy

Landmark elements can be registered with the `useLandmark` hook. The `role` prop is required.

Pressing <Keyboard>F6</Keyboard> will move focus to the next landmark on the page, and pressing <Keyboard>Shift+F6</Keyboard> will move focus to the previous landmark.
If an element within a landmark was previously focused before leaving that landmark, focus will return to that element when navigating back to that landmark.
<Keyboard>Alt+F6</Keyboard> will always move focus to the main landmark if it has been registered.

If multiple landmarks are registered with the same role, they should have unique labels, which can be provided by aria-label or aria-labelledby.

For an example of landmarks in use, see the [useToastRegion](Toast/useToast.md#anatomy) documentation.

## A

PI

<FunctionAPI
  function={docs.exports.useLandmark}
  links={docs.links}
/>

### Aria

LandmarkProps

| Name | Type | Description |
|------|------|-------------|
| `role` \* | `AriaLandmarkRole` | — |
| `focus` | `((direction: "forward" | "backward") => void) | undefined` | — |
| `aria-label` | `string | undefined` | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | Identifies the element (or elements) that labels the current element. |
| `aria-describedby` | `string | undefined` | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | Identifies the element (or elements) that provide a detailed, extended description for the object. |

### Landmark

Aria

| Name | Type | Description |
|------|------|-------------|
| `landmarkProps` \* | `DOMAttributes<FocusableElement>` | — |
