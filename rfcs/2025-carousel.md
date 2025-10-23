<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2025-09-01
- RFC PR: 
- Authors: Nikolas Schröter

# Rotator (Slide Show or Carousel)

#### A carousel presents a set of items, referred to as slides, by sequentially displaying one or more slides.

## Introduction
---
This RFC proposes a three-part addition to the API of React Aria/Stately. 

In the first part, we will introduce new `@react-stately/rotator` and `@react-aria/rotator` packages, which leverage ideas from the existing virtualizer and layout platform. Together, these packages will allow **any** React Aria/Stately Collection to be bidirectionally controlled in its scroll offset and snap target, especially when virtualized.

For the second part, we will build upon this new infrastructure in `@react-stately/carousel` and `@react-aria/carousel` packages, which are designed to implement the [ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/). These packages will provide support for both **grouped** and **tabbed** carousel styles as well as auto-rotation, and come with the option to force-mount into a scroll container.

Lastly, we will extend the `@react-stately/layout` package with a new `CarouselLayout`. This layout extends the existing `ListLayout` with capabilities for infinite scroll wrapping as well as support for Netflix-inspired hierarchical content displays.

## Motivation
---
From streaming platforms to e-commerce storefronts, rotational presentation containers remain a ubiquitous pattern in modern web design. Unsurprisingly, a Carousel component for React Aria is one of the most frequently requested UI elements in developer communities and on social media. Libraries providing carousel functionality consistently rank among the most popular in the ecosystem, with some approaching 10+ million weekly downloads.

Notably, this pattern is absent from most major component libraries, largely due to its controversial nature and the unique accessibility challenges it poses. Dedicated third-party implementations have opted to emulate scrolling through transforms and JavaScript-driven snapping. While effective, these approaches can significantly inflate bundle size - oftentimes exceeding 10KB minified+gzipped — and, more importantly, will neither feel fully native nor offer adequate accessibility.

We have a unique opportunity to leverage React Aria’s hook-based API and layout platform to deliver an accessible rotation controller that aligns with RAC's composition architecture and is extremely versatile. Unlike existing solutions, such an implementation could provide a truly native experience, with minimal bundle overhead, potentially achieving an order-of-magnitude improvement not only in bundle size but also in feature scope and accessibility.

## Example
---
```tsx
import {Button, Carousel, Slide, SlidePicker, SlidePickerList, SlideShow} from 'react-aria-components';
import {ChevronLeft, ChevronRight, Dot, Play} from 'lucide-react';

<Carousel>
  <Button slot="play"><Play size={16}/></Button>
  <Button slot="previous"><ChevronLeft size={16}/></Button>
  <Button slot="next"><ChevronRight size={16}/></Button>

  <SlidePickerList>
    <SlidePicker id="1"><Dot size={8}/></SlidePicker>
    <SlidePicker id="2"><Dot size={8}/></SlidePicker>
    <SlidePicker id="3"><Dot size={8}/></SlidePicker>
  </SlidePickerList>

  <SlideShow>
    <Slide id="1">Slide 1</Slide>
    <Slide id="2">Slide 2</Slide>
    <Slide id="3">Slide 3</Slide>
  </SlideShow>
</Carousel>
```
<details >
  <summary style="font-weight: bold">Show CSS</summary>
  <div style="background-color: #313640; white-space: pre;">
    .react-aria-Carousel {
      display: grid;
      grid-template-areas:
        "play . previous next"
        "show show show show"
        "picker picker picker picker";
      grid-template-rows: repeat(3, max-content);
      grid-template-columns: auto 1fr auto auto;

      .react-aria-Button[slot="play"] {
        grid-area: play;
      }

      .react-aria-Button[slot="previous"] {
        grid-area: previous;
      }

      .react-aria-Button[slot="next"] {
        grid-area: next;
      }

      .react-aria-SlidePickerList {
        grid-area: picker;
        display: flex;
        gap: 4px;
      }

      .react-aria-SlideShow {
        grid-area: show;
        display: flex;
        gap: 12px;
      }
    }
  </div>
</details>

## Features
---
A carousel can be built using `<div role="tab">` and `<div role="tabpanel">` HTML elements, but this only supports one perceivable element at a time. Carousel helps you build accessible multi-view rotation components that can be styled as needed.

- **Native** - Carousel is built on native CSS Overflow Module Level 3 and CSS Scroll Snap Module Level 1, delivering a mobile-equivalent experience with an extremely light bundle overhead.
- **Flexible** – Support for both horizontal and vertical orientations, disabled slides, custom rotation order, multi-view pagination, and eager control state updates.
- **Rotation controls** – Slides can be brought into view using next/previous rotation controls and/or a slide picker. Optionally, auto-rotation, with custom timing and back-off strategies are supported as well.
- **Integrated** – Works with React Aria ListBox and GridList components. Integrated with React Aria's drag and drop, selection, and async loading implementations.
- **Virtualized scrolling** – Use Virtualizer to improve performance of large slide shows by rendering only the visible slides.
- **Infinite mode** – Support for infinite rotations via a dedicated carousel layout for React Aria's Virtualizer. This extends to hierarchical content displays where the layout becomes infinite after a threshold is exceeded.
- **Accessible** – Follows the [ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/), with optional slide announcements via an ARIA live region. Extensively tested across many devices and assistive technologies to ensure announcements and behaviors are consistent.

## Anatomy
---
<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/890770d2-4062-4c36-a3a6-77916c3a7a00/Markdown" alt="Carousel Anatomy" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/890770d2-4062-4c36-a3a6-77916c3a7a00/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>

## Detailed Design
---
At their core, carousels allow users to navigate between slides of content while maintaining either spatial or temporal continuity. The way in which slides transition from one to another defines the **animation model** of the carousel and directly influences both the user experience and the underlying implementation. Broadly, two animation models are most common:

- **Single-view transitions** — only one slide is visually emphasized at a time. This may be implemented with fading, crossfading, direct replacement, or even a scroll-based presentation where multiple slides are force-mounted, but only the currently selected slide is highlighted.

- **Multi-view transitions** — multiple slides are perceivable at once, typically arranged in a scroll container where adjacent slides remain partially or fully visible.

To cater to these animation models, this RFC introduces two corresponding implementation strategies, which will serve as reference points throughout the document:

- **Tabbed** — designed around the single-view animation model.

- **Presentational** — intended for multi-view content displays.

Since both animation models can be mounted into a scroll container, this design section begins by laying the groundwork required for that functionality - more specifically, the addition of a new `@react-stately/rotator` package.

### Scroll containers

At a high-level, `@react-stately/rotator` will implement a lightweight scroll and snapping observer based on the CSS Overflow Module Level 3 and CSS Scroll Snap Module Level 1 specification. Since scroll destinations are tightly coupled to layout information, the package's architecture will feel similar to the existing `Layout` and `Virtualizer` implementation. More specifically, the RFC proposes the addition of the following new classes:

- `ScrollArea` - An implementation of the `Rect` interface to track scroll-margin-adjusted positioning and self-alignment of a target element in a [Scrollport](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container#scrollport) or snapping-enabled [Snapport](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_snap#snapport).

- `ScrollInfo` - A lightweight wrapper, similar to `LayoutInfo`, to represent each element in a scroll container. This class carries both layout `Rect` and `ScrollArea` of an item.

- `ScrollDelegate` - Similar to `Layout`, this abstract is spawned by each collection and implements both `LayoutDelegate` and `KeyboardDelegate`. It measures the [Scrollport](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container#scrollport) and its `ScrollAreas` and controls the playback order of targets when rotation controls are engaged. To perform animations, each `ScrollDelegate` is connected to an animation delegate, keeping the state layer free of the DOM and enabling custom animation curves.

- `ScrollManager` - A macro-class, designed to orchestrate `ScrollDelegates` and control a state delegate for rotation controls. Each `ScrollDelegate` will register itself against an available `ScrollManager` and update it independently. When rotation controls are invoked on the manager, `ScrollManager` may freely determine when to queue animations in its registered delegates - possibly locking multiple together - and when to queue state updates (`eager` or `lazy`).

These classes are instantiated by an accompanying set of state hooks - `useScrollManagerState()` and `useScrollState()`. Similar to `useVirtualizerState()`, a `ScrollDelegate` is stable and connects to `useScrollView()` to receive updates in its collection, visible rect, and scrolling state. A `scrollOptions` object may be provided by either carousel and/or controlled collection to customize target positioning and playback order (e.g. `skipSections="true"`). When these options aren't sufficient, a controlled collection may also provide an entire `ScrollDelegate` constructor/instance to override every aspect of the default `ListScrollDelegate`. 

To streamline usage of the state, a thin component layer, equivalent to `<Virtualizer />` and `<VirtualizerItem />`, may optionally be added in `@react-aria/rotator`.

<div style="background-color:rgba(206, 127, 127, 0.2)">

> **Disclaimer**: Since `ScrollDelegates` rely on a layout delegate to perform position measurements, they have a strong dependency on up-to-date layout information — especially in virtualized scenarios. To prevent overhead renders for synchronization, `ScrollDelegate` updates should be applied only **after** the `Virtualizer` has finished its rendering phase.

</div>

With this infrastructure in place, developers can leverage native CSS properties — `scroll-behavior`, `scroll-padding`, `scroll-margin`, `scroll-snap-align` and `scroll-snap-type` — to customize scroll targets and define how their areas shall align and be scrolled into view when selected. Each time the scroll offset is changed, the default algorithm of a `ScrollDelegate` will determine the active target by performing a nearest area search for the current scroll offset. When multiple targets are equally aligned to their target position (e.g. a section and its first/last child), the rotation controls will display **multiple** targets as selected.

<div style="background-color: rgba(206, 190, 127, 0.2)">

> **Hint**: While scroll state and target activity are reported by `ScrollDelegates`, the existence of targets is not - Instead, `ScrollManagers` state delegate receives a collection of possible targets, enabling a developer to fully customize controls as long as keys are matched.  In practice, a `ScrollManagers` state delegate may simply be a `ListStates` selection manager, providing a straightforward migration path between animation models and different hooks depending on the required complexity.

</div>

To wrap this section up, here is an explanatory diagram to recap the functionality of the `@react-stately/rotator` package. It displays a carousel with a subset of collection keys as possible scroll targets (`slide-1`, `section-2`, `slide-4`) and a custom area on the current target. Once again, note that rotation controls, such as the picker and buttons, may **always** act on available targets, rather than items of the controlled collection.

<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/d2e333aa-e980-4996-b2f6-2208e647bf00/Markdown" alt="Rotator Design" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/d2e333aa-e980-4996-b2f6-2208e647bf00/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>


### API Fundamentals

With the scroll container functionality established, we can now address the design challenges of each implementation strategy. To design the API, let us first revisit the core design goals of React Aria (Components) and derive the corresponding objectives for this API.

> The React Aria Components API is designed around composition. Each component generally has a 1:1 relationship with a single DOM element, which makes it easy to style every element and control the layout and DOM order of the children.

Adhering to these principles, the carousel API will provide a unified surface, enabling developers to freely compose rotation controls and switch between animation models without sacrificing functionality or accessibility. This starts with a common mechanism for constructing state, independent of the chosen implementation strategy.

The following four-step process introduces the API surface of our carousel implementation, explains how state for both rotation controls and slides is established, and intentionally highlights the key synchronization between them. For this example, we will build a **tabbed** carousel, force mounted into a rotator controlled scroll container.

#### 1. Declaration (React Aria Components)
```tsx
import {Button, Carousel, Slide, SlidePicker, SlidePickerList, SlideShow} from 'react-aria-components';
import {ChevronLeft, ChevronRight, Dot} from 'lucide-react';

<Carousel>
  <Button slot="previous"><ChevronLeft size={16}/></Button>
  <Button slot="next"><ChevronRight size={16}/></Button>

  <SlidePickerList>
    <SlidePicker id="1"><Dot size={8}/></SlidePicker>
    <SlidePicker id="2"><Dot size={8}/></SlidePicker>
    <SlidePicker id="missing-key"><Dot size={8}/></SlidePicker>
    <SlidePicker id="3"><Dot size={8}/></SlidePicker>
    <SlidePicker id="4"><Dot size={8}/></SlidePicker>
  </SlidePickerList>

  <SlideShow shouldForceMount style={{overflow: 'scroll'}}>
    <Slide id="1">Slide 1</Slide>
    <Slide id="2">Slide 2</Slide>
    <Slide id="3">Slide 3</Slide>
    <Slide id="4">Slide 4</Slide>
    <Slide id="5">Slide 5</Slide>
  </SlideShow>
</Carousel>
```
<div style="background-color: rgba(206, 190, 127, 0.2)">

> **Hint**: The example purposefully features a `key=missing-key` element in the picker collection to illustrate automatic filtering of missing keys.

</div>

As the tabbed strategy closely resembles an [ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), our carousel API shall also closely follow the API of our existing `Tabs` component - reusing its mental model and prop structure while introducing new primitives: `TabList` becomes `SlidePickerList`, `Tab` turns into `SlidePicker` and `TabPanel` becomes `Slide`. Analogous to the original, rotation controls, when present, need to precede panels(<span style="color: rgba(206, 127, 127, 1)">*</span>) and each `Slide` remains associated with its corresponding `SlidePicker` by sharing the same id.

Where this API extends beyond the `Tabs` component is in how panels are organized: individual `Slides` are mounted within a `SlideShow` collection and are either force-mounted all at once or not at all. This design offers significant flexibility - switching between animation models requires nothing more than a style change on the collection, upgrades or downgrades in implementation strategy are easily covered by swapping the `SlideShow` for a `ListBox` or `GridList` and virtualization of slides remains straightforward.

Within this architecture, `Carousel` functions primarily as a custom renderer - similar to `Virtualizer` - that injects scroll delegates for slide collections, allowing them to register with the carousel’s scroll management state. Slide elements may internally be wrapped in a presentational container to track layout information. To maintain compatibility with custom renderers positioned between the `Carousel` and slide collection, this renderer can either be re-implemented or inherited by downstream renderers (e.g. `Virtualizer`).


#### 2. JSX Parsing (@react-aria/collections)
```html
<Carousel.CollectionBuilder>
  <Hidden />
  <Hidden />

  <SlidePickerList.Collection>
    <Node type="item" key="<carousel-id>::1" />
    <Node type="item" key="<carousel-id>::2" />
    <Node type="item" key="<carousel-id>::missing-key" />
    <Node type="item" key="<carousel-id>::3" />
    <Node type="item" key="<carousel-id>::4" />
  </SlidePickerList.Collection>

  <SlideShow.Collection>
    <Node type="item" key="1" />
    <Node type="item" key="2" />
    <Node type="item" key="3" />
    <Node type="item" key="4" />
    <Node type="item" key="5" />
  </SlideShow.Collection>
</Carousel.CollectionBuilder>
```
Since our design splits up responsibilities to remain flexible, we are introduced with unique challenges when parsing the JSX tree for collection nodes, as two collections must be hoisted for further processing in the render phase. This behavior can be accommodated within the existing collection builder infrastructure by scoping all picker node keys. The scope is generated internally and never exposed to developers.

#### 3. Rendering (@react-stately/list)
```html
<Carousel>
  <ListState.Collection id="picker">
    <Node type="item" key="1" />
    <Node type="item" key="2" />
    <Node type="item" key="3" />
    <Node type="item" key="4" />
  </ListState.Collection>

  <ListState.Collection id="show">
    <Node type="item" key="1" />
    <Node type="item" key="2" />
    <Node type="item" key="3" />
    <Node type="item" key="4" />
    <Node type="item" key="5" />
  </ListState.Collection>
</Carousel>
```
From a state perspective, both implementation strategies can be represented by two states, derived from two independent collections - one `show` collection for the slides themselves, and one `picker` collection for our rotation targets. To construct these states, we take our pre-built and prefixed collection from the parsing phase and `.filter()` it into two, removing all pre-fixed keys from the `show` collection and only leaving mutual keys in the `picker` collection. Meanwhile, keys in the `picker` collection are stripped of their carousel prefix to make further usage intuitive.

#### 4. Output
<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/7ce4185a-814b-4547-95fa-c1b4d9619700/Markdown" alt="Carousel API Example" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/7ce4185a-814b-4547-95fa-c1b4d9619700/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>

The final render result is a **tabbed** carousel within a **multi-view transition** animation model. Rotation controls render four pickers, with the previous button disabled since the first key is currently selected. The slide collection itself contains five items and is fully independent from the rotation state.

It should be noted that scroll interactions within the slide collection do not automatically propagate to the slide picker list. This behavior is intentional — both the picker list and any collection(s) registered with the `ScrollManager` remain fully independent scrollable regions, each maintaining their own scroll state and layout.

If synchronized scrolling between the two is desired, developers can implement it manually with just a few lines. The `onSelectionChange` callback provides access to the `ScrollArea` of the selected element through its second argument, which can be used to perform a custom scroll and keep both regions visually aligned. This design allows developers to decide when and how synchronization occurs, rather than enforcing it by default. 

```tsx
let onSelectionChange = (key: string, area: ScrollArea): void => {
  if (!area.isVisible && ref.current) {
    ref.current.scroll({left: area.x, top: area.y, behavior: 'smooth'});
  }
};

<SlidePickerList ref={ref} onSelectionChange={onSelectionChange} style={{overflow: 'scroll'}}>
  <SlidePicker id="1"><Dot size={8}/></SlidePicker>
  <SlidePicker id="2"><Dot size={8}/></SlidePicker>
  <SlidePicker id="3"><Dot size={8}/></SlidePicker>
  <SlidePicker id="4"><Dot size={8}/></SlidePicker>
</SlidePickerList>
```

### Automatic Rotation

To accommodate an auto-rotation feature and its associated accessibility requirements, this RFC proposes the addition of a `useAutoRotationState()` hook to the `@react-stately/rotator` package. This hook extends the functionality of `usePlayToggleState()` — a lightweight, specialized wrapper around `useToggleState()` — and provides a consistent API for managing automated rotation state within the carousel.

`useAutoRotationState()` encapsulates the timing, playback, and user interaction logic required to manage auto-rotation, while maintaining compatibility with React Aria’s controlled and uncontrolled state patterns. It exposes the following interactions:

- `rotate()` - Stops or delays the scheduled interval based on either `stop` or `debounce` behavior.
- `pause` - Stops the auto-rotation until `resume()` is invoked.
- `resume` - Resumes the auto-rotation.
- `toggle` - Toggles between paused and active states.

Whenever a scheduled interval expires, an `onAutoRotation` callback is invoked. This callback can be used to prompt a `ScrollManager` to perform rotations through its connected `ScrollDelegates` or to trigger other side effects if required, making the hook versatile enough to gracefully handle scenarios where auto-rotation is disabled or manual interaction takes precedence.

### Accessibility

For screen readers and keyboard users, the **tabbed** implementation strategy of a carousel is mostly straightforward, as it is largely covered by the guidelines of the [ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and [ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). It does also not matter whether we present a carousel in a **multi-view** animation model or not, as long as only one slide is active at a time and it's ensured to be persisted in the DOM (e.g. when virtualized).

Only minor adjustments to this pattern are required to support optional picker elements and prevent duplicate announcements within the slideshow’s live region. Both issues are addressed by loosening the strict labeling relationship between picker and panel, instead labeling pickers with their corresponding panels - an approach already validated by the [APG Tabbed Carousel Example](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/carousel-2-tablist/).

At this point it's noteworthy that when rotation controls are present, they should **always** precede slide panels in the tab sequence, even if they appear as visual successors. Testing from the team at Accessible360 has shown that keyboard users are unfamiliar with tab patterns where controls follow panels, and find navigation more intuitive when controls are encountered first.

To recap, here are two diagrams which capture the ARIA semantics applied to a **tabbed** carousel, illustrated across both distinct animation models.

<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/9f7953ec-45b1-4f77-dc58-704e7c473200/Markdown" alt="Tabbed Single-View Carousel Accessibility Anatomy" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/9f7953ec-45b1-4f77-dc58-704e7c473200/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>
<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/f7f422e6-cc19-46f2-235d-bac79e1a9a00/Markdown" alt="Tabbed Multi-View Carousel Accessibility Anatomy" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/f7f422e6-cc19-46f2-235d-bac79e1a9a00/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>

With the **tabbed** style covered, what remains is how to meaningfully convey a **presentational** style carousel to screen readers. As a reminder, the **presentational** is used when rendering a `ListBox` or `GridList` instead of a `SlideShow`, resulting in multiple slides being fully perceivable and interactive at the same time. To detect usage of this style in our hook layer, we can leverage our existing slot utilities.

When in this mode, the implementation strategy will delegate announcements and focus management to the underlying (selectable) collection, leaving rotation controls only responsible for updating the scroll offset. ARIA labels are adapted to convey changes in scroll position instead of perception (e.g. slide visibility), and the `aria-controls` attribute is pointed to the collection as a whole rather than the active slide. 

On wheel events, the `focusedKey` of the underlying collection remains static. Optionally, we may elect to synchronize `focusedKey` when rotation controls are engaged with, allowing the focus restoration logic of the collection to take over when the relationship is followed. 

All remaining accessibility success criteria, such as the ones for automatic rotation, remains in parity with the **tabbed** implementation strategy and in accordance with the [ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). To help digest these differences, the following diagram will present the ARIA semantics of a **presentational** carousel, illustrated in its **multi-view transition** animation model.

<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/6e2fa095-8a91-4111-3eb6-5bde76475a00/Markdown" alt="Presentational Multi-View Carousel Accessibility Anatomy" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/6e2fa095-8a91-4111-3eb6-5bde76475a00/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>

### Infinite Layouts

For our final design section, we turn to the most ambitious feature of a native carousel implementation: **Infinite mode**. This mode, commonly seen on streaming platforms and hero banners, is used to continuously showcase new or dynamic content and primarily ships in two layout styles:

- **Unordered** - An endlessly revolving list of slides, where the user can scroll seamlessly and the collection appears to wrap at its respective boundaries.

- **Hierarchical** - A standard, scrollable list of slides arranged in a logical content hierarchy. Upon reaching a defined element or threshold, the list transitions into an **unordered** carousel.

While many libraries implement this behavior using CSS transforms combined with touch or drag handling in JavaScript, replicating a truly infinite scrollport in a native scroll container proves to be a significant challenge - especially when `scroll-snap-stop: always` is not mandatory. Fortunately, our `Carousel` design supports both virtualized and unvirtualized scenarios. Building on this foundation, this RFC will aim to provide a solution to this problem via a custom `CarouselLayout`, capable of managing vertical and horizontal slide collections that revolve endlessly.

In short, this means, to enable infinite mode, a `Virtualizer` is required to be wrapped around the slide collection. The following example demonstrates the API to enable infinite mode on a **presentational** carousel, along with its rendered output in both **hierarchical** and **unordered**  style, scrolled to its second target.

```tsx
import {Button, Carousel, CarouselLayout, ListLayout, ListBoxItem, SlidePicker, SlidePickerList, ListBox, Virtualizer} from 'react-aria-components';
import {ChevronLeft, ChevronRight, Dot, Play} from 'lucide-react';

let items = [
  {id: '1', name: 'Slide 1'},
  {id: '2', name: 'Slide 2'},
  {id: '3', name: 'Slide 3'},
  {id: '4', name: 'Slide 4'},
];

<Carousel>
  <Button slot="play"><Play size={16}/></Button>
  <Button slot="previous"><ChevronLeft size={16}/></Button>
  <Button slot="next"><ChevronRight size={16}/></Button>

  <Virtualizer layout={ListLayout} layoutOptions={{orientation: 'horizontal', rowHeight: 8, gap: 8}}>
    <SlidePickerList items={items}>
      {(item) => <SlidePicker id={item.id}><Dot size={8}/></SlidePicker>}
    </SlidePickerList>
  </Virtualizer>

  <Virtualizer layout={CarouselLayout} layoutOptions={{orientation: 'horizontal', rowHeight: 200, gap: 12, infinite: true}}>
    <ListBox items={items} style={{overflow: 'scroll'}}>
      {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
    </ListBox>
  </Virtualizer>
</Carousel>
```

<div style="background-color: rgba(206, 190, 127, 0.2)">

> **Hint**: The example purposefully features a `Virtualizer` also for the picker collection. While not necessary for infinite mode, the example should also serve as demonstration for how to implement a carousel with large item counts. Both `Virtualizers` remain fully independent of each other and feature different layouts.

</div>

<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/f91decc0-00e5-41c5-6eaf-7fca7b4d3800/Markdown" alt="Hierarchical Infinite Mode Example" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/f91decc0-00e5-41c5-6eaf-7fca7b4d3800/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>



<div style="width: 100%; background: #F5F6FC; display: flex; justify-content: center; align-items: center; padding: 2rem 0px 1rem 0px; position: relative; margin-bottom: 12px;">
  <img src="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/a6c0d2d3-8466-4b67-8ed6-711fc7483b00/Markdown" alt="Unordered Infinite Mode Example" />
  <a href="https://imagedelivery.net/yBU8mJlXW3rs0IX3KL3zRA/a6c0d2d3-8466-4b67-8ed6-711fc7483b00/Markdown" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">⛶</a>
</div>

Within infinite mode, the [Scrollport](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container#scrollport) is expanded to a large finite area sized to `contentSize * 3` with a minimum of `100,000px`. On first load, the scroll offset is moved to the center of the scrollport, providing a large surface for continuous scrolling in both directions, even when `scroll-snap-stop: always` is not active.

To determine which items to render in the virtual visible rect, `CarouselLayout` simply offsets the `LayoutInfo` of each item. When idle, e.g. on `scrollend`, the scroll offset is reset to the middle, creating the illusion of an endless surface.

## Documentation
---
This is a moderate addition to the API that only requires updates to the existing documentation. Most of this RFC should be able to provide a good guideline for documentation.

## Drawbacks
---
This is a moderate addition to the API that will need to be maintained. However, it is a relatively lightweight layer, with similar semantics to the existing layout implementation.

## Backwards Compatibility Analysis
---
This is a backwards compatible change. It mostly introduces new APIs, and only requires small, albeit critical, modifications to the API or implementation of our existing hooks. The migration path primarily consists of three adjustments:

- Extending support for `DOMLayoutDelegate` to be able to query **all** collection elements, not limited to ones that leverage selection hooks. This is the most difficult out of all migrations to implement without breaking backwards compatibility or introducing code duplication.

- Migrating `Rect`, `Point`, `Size` classes from `@react-stately/virtualizer` into `@react-stately/utils` or possibly a new shared base package.

- Migrating `useScrollView()` and its associated `RTL` offset utils from `@react-aria/virtualizer` into general purpose `useScrollObserver()` and `useScrollView()` hooks, placed in `@react-aria/utils`.

## Alternatives
---
As highlighted in the motivation for this RFC, there are currently no carousel libraries in the ecosystem that provide native scroll-based rotation — or any comparable interaction for that matter — while remaining fully accessible. Existing solutions often compromise on keyboard navigation, slide interactivity, or focus management, leaving critical gaps in compliance with accessibility standards.

Introducing large third-party libraries into an application already built on React Aria adds further strain to Time to Interactive (TTI) metrics, which are already impacted by the considerable footprint of the React Aria compatibility layer.

## Open/Frequently asked questions
---
#### Should auto-rotation be resumable while focus is inside the carousel?
While auto-rotation stops when focus enters the carousel, the [APG Tabbed Carousel Example](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/carousel-2-tablist/) does resume when manually instructed. This may cause challenges when auto-rotations triggers `inert` to be set on slides with active focus, and frankly looks weird when focus remains on clipped elements. I'm wondering whether this behavior is even desirable in the first place.

#### Should **tabbed** carousels follow tab or button group ARIA roles, or possibly both?
N/A

#### Should **presentational** Carousels also support (live) announcements for the scroll offset?
A separate live region element, via `@react-aria/live-announcer`, could enable live announcements of scroll offset even in **presentational** style carousels. Unlike the **tabbed** strategy, this implementation design does not have elements change their visibility in the accessibility tree when reaching their target scroll position, meaning a regular `aria-live` attribute on the container will not announce a change.

#### Should `@react-stately/rotator` be its own package or be bundled into `@react-stately/carousel`?
N/A

#### Should controls be required to preceed slides in the JSX tree or should the tab sequence be controlled programmatically?
N/A

#### Why do infinite layouts require large scroll widths, instead of moving offset while scrolling?
While possible to implement smoothly on desktop browsers, motion scroll will **always** abort on mobile devices, when the scroll position is moved in the opposite scroll direction. This makes for a visually unpleasing experience, so we delay mutations to the offset until scrollend is fired. To uphold the illusion of an infinite surface area, we make sure the area is reasonably large to never be fully explored in a single motion - even without `scroll-snap-stop: always` applied to each slide. For a closely related working thesis, see this example of a [Swipeable Calendar](https://x.com/devongovett/status/1980322109831410113).

#### Should **unordered** infinite carousels repeat items even when the collection does not overflow?
N/A

#### Should **hierarchical** infinite carousels support a threshold sentinel item?
N/A


## Roadmap
---
  - [ ] https://github.com/adobe/react-spectrum/pull/8523 (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [X] https://github.com/adobe/react-spectrum/pull/8715 (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [X] https://github.com/adobe/react-spectrum/pull/8696 (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] https://github.com/adobe/react-spectrum/pull/8533 (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Feat: Inherit collection ids from BaseCollection(<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Feat: Add optional ref to CollectionNode and CollectionBranch(<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Feat: Scroll observation w/ useScrollObserver() and useScrollView()(<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Chore: Migrate Rect, Point & Size classes into @react-aria/utils (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Feat: Extend selection management in single select list states w/ SingleSelectionManager
  - [ ] Feat: Add visual label support to grid cells and list options (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Feat: Add scroll control w/ @react-stately/rotator packages (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Feat: Add Carousel component and @react-aria/carousel packages (<span style="color: rgba(206, 127, 127, 1)">*</span>)
  - [ ] Feat: Add CarouselLayout to @react-stately/virtualizer (<span style="color: rgba(206, 127, 127, 1)">*</span>)

## Help Needed
---
I consider every proposed change to `@react-stately`, `@react-aria` and `react-aria-components` packages as scope of work for what I am willing to contribute. Parts of the proposed changes unfortunately require support of specific Adobe teams - namely the localization, accessibility and React Spectrum team(s) - to review, test and document these changes. 

Furthermore, if a carousel component is to be added to `React Spectrum (v2)`, a design sheet and implementation assistance from the core maintainers is required.

## Related Discussions
---
- https://github.com/adobe/react-spectrum/issues/8699
- https://github.com/adobe/react-spectrum/pull/8630
- https://github.com/adobe/react-spectrum/pull/8553
