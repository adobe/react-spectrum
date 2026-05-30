<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2023/7/27
- RFC PR: exploration PRs: https://github.com/adobe/react-spectrum/pull/4836, https://github.com/adobe/react-spectrum/pull/4837
- Authors: Daniel Lu

# Improving React Spectrum test writing experience

## Summary

This RFC proposes a three part improvement to the test writing experience for consumers of React Spectrum/Aria Components. It will cover possible additions to our documentation for test writing education and gotchas, discuss a list of low level helper/utility function to expose that can aid in test setup/interactions, and propose a new set of high level utility classes that aim to simplify writing various common component interactions during testing.

## Motivation

As both the adoption of React Spectrum and the complexity of the components offered has grown, various testing pain points have surfaced, both from within the maintaining team and from consumers of the library itself. For a outside consumer writing tests that run in a non-browser environment, it is hard to know what exactly needs to be mocked to make certain components (e.g. virtualized components) even render properly. They may not be familiar with the internal structure of a component and how best to target/interact those nodes, that a component has a transition or requestAnimationFrame internally and thus needs a equivalent wait time, or even what events need to be fired to simulate common operations like drag and drop. As a result, many people often have to directly reference the tests within the library itself or dig into the component's internals when they run into any test issues. This can be very time consuming and frustrating for someone trying to write a simple interaction test, and adds unnecessary friction for new adopters.

These are non-trivial issues for maintainers of the library and have resulted in various internal testing utils and patterns, but things like common component interactions are typically duplicated across test files instead of being centralized. Explicit documentation of various testing gotchas doesn't really exist and has become internalized knowledge instead.

We hope that documenting these testing gotchas externally will reduce the test debugging frustration, and that exposing testing utilities for common test setup and component interactions will simplify the overall test writing experience, leading towards easier adoption.


## Detailed Design

As mentioned earlier, there are three proposed parts to this initiative:

1. Documentation of testing gotchas/common issues

There are a number of common mocks that users often have to set up in order to have various components properly render or behave as they do in browser. These include the following:

- Mock of `HTMLElement.prototype`'s `clientWidth`, `clientHeight`, and `scrollHeight`. This is necessary for many of our virtualized collection components like ListBox and TableView. Without these the component often renders with zero height/width and thus zero items. An example of these mocks can be found [here](https://github.com/adobe/react-spectrum/blob/07f673acb2d68144156df3aa0db6e91810b12c67/packages/%40react-spectrum/listbox/test/ListBox.test.js#L71-L76).
- Mock of `HTMLElement.prototype`'s `getBoundingClientRect`. Often mocked for drag and drop operations, an example can be found [here](https://github.com/adobe/react-spectrum/blob/07f673acb2d68144156df3aa0db6e91810b12c67/packages/%40react-aria/dnd/test/dnd.test.js#L39-L46).

There are other mocks that teams have historically needed, but the above are two of the most commonly brought up. Additionally, the way we've mocked the above in the React Spectrum tests changes it for ALL HTMLElements which maybe too broad for other people's test suites, hence why I'm leaning towards simply documenting this behavior rather than creating a utility function.

In addition to these common mocks, I feel like it would be helpful to compile a list of common issues/error messages people have run into when writing tests using React Spectrum components and add a FAQ section to our existing "Testing" page in the docs. These issues may disappear as we expose more utility functions and classes, but it is a good short term goal that shouldn't take too much time investment.


2. Create/expose low level util functions for basic test setup and interactions

Some mocks we use feel like they could be applied universally, such as the mock for `window.screen`'s width when simulating a mobile device. We could expose this as `simulateMobile`/`simulateDesktop` so that users don't have to know the nitty gritty of what breakpoint we use when determining whether to render the mobile version of a React Spectrum component. Another example of a lower level util would be be for triggering a long press event. Instead of needing to know how long it takes before a pointerDown event is considered a long press or that you need to mock support for `PointerEvent` globally, we could provide our internal `triggerLongPress` test util alongside with `installPointerEvent` for mocking `PointerEvent` support. A drag and drop (via mouse and keyboard) interaction utility is another good candidate, as is a render wrapper that wraps arbitrary children in a Provider.

In general, there are several internal test utils [here](https://github.com/adobe/react-spectrum/blob/07f673acb2d68144156df3aa0db6e91810b12c67/packages/dev/test-utils/src/events.ts) and in our tests that we should consider exposing that handle issuing/simulating the press/touch events that would happen in the browser. Ideally, using the `user-event` library would eliminate the need for most, if not all, of the interaction related util functions, but has proved insufficient in various cases (like for long press). We'll have to convert our own tests to use the `user-event` v14 and see if any other internal test utils can be replaced entirely.

These util functions would live in one of two packages perhaps, `@react-aria/test-utils` and `@react-spectrum/test-utils`. The differentiating factor would be if the util is specific to our React Spectrum components (`simulateMobile`/`simulateDesktop`) or not (`triggerLongPress`).

Caveat: The high level test util classes that are discussed below may also minimize the need for some of these interaction utils, open for discussion.


3. Create high level test util classes to handle common interaction patterns

Many of our components have several core user interaction patterns. For a ComboBox or a Picker, a user will usually open the dropdown via a click, look for a option in the list, and select that option. This is a pretty simple interaction but requires a fair bit of prerequisite knowledge to properly execute in a test. The test writer has to
find the right element to press, wait for the dropdown to open and transition in, find the listbox and desired option, and finally click on said option and wait for the dropdown to transition out. Sometimes using `user-event` backfires and the order/timing of the underlying events fired doesn't match browser behavior, resulting in a test-env only failing test that is extremely hard to debug.

To solve this, we could create a test helper class for each ARIA pattern (i.e. table, list, select, button, etc) that contains methods for common interactions specific to the pattern as described in [this issue comment](https://github.com/adobe/react-spectrum/issues/3703#issuecomment-1302727331). The interaction methods would need to work for `realTimers` and `fakeTimers` (if using Jest) and would handle all the requisite element lookup and event firing required for the high level interaction pattern. Where ever possible, these interaction methods should use `user-event` or our other interaction utils. Additionally, it may be valuable for each of the classes to look up and expose the internal nodes that users often want to assert against (e.g. The picker's trigger button, label, listbox, etc). A implementation of this could look like the following:

```jsx
render(
  <Provider theme={theme}>
    <Picker label="Test" data-testid="test" onSelectionChange={onSelectionChange} onOpenChange={onOpenChange}>
      <Item key="one">One</Item>
      <Item key="two">Two</Item>
      <Item key="three">Three</Item>
    </Picker>
  </Provider>
);

let picker = new SelectTester({element: screen.getByTestId('test'), timerType: 'real'});
await picker.selectOption('Three');
expect(picker.trigger).toHaveTextContent('Three');
```

Since these classes are specific to each ARIA pattern, they should work for React Aria Components (RAC) as well as React Spectrum (RSP) components and thus need to handle possible differences in what `element` is provided. For instance, the `data-testid` passed to a RSP Picker is attached to the trigger button element but the `data-testid` for a RAC Select could be the one attached to the wrapper element instead. Alternatively, we could just standardize what `element` is expected to be provided to each of the util classes (aka make the user pass in the Select's trigger button element).

These util classes could live in the `@react-aria/test-util` package and re-exported from `react-aria-components`.

## Documentation

Documentation for the first two parts described above should go in the existing "Testing" page that we have [in the docs](https://react-spectrum.adobe.com/react-spectrum/testing.html#testing) already. We'll want to consider having a similar page in the React Aria Component/React Aria docs sections as well or moving that page up in hierarchy so it lives on the [main page](https://react-spectrum.adobe.com/index.html). The test util classes could also be documented in the same page as the rest of the testing info. I think we should also include a testing section in each of the individual component pages that highlights what test util class can be used (aka mapping Picker to SelectTester), documents the class's methods and options, and links back to the overall testing FAQ for common issues/gotchas that are related to said component. The main testing page should also show a high level example of using a test util class in a example test.

## Drawbacks

My primary concern is whether or not some of the mocks truly work in other test suite configurations. Historically, we've seen other teams struggle with a small subset of the mocks not resolving their test rendering issues (specifically with ListBox and the `clientHeight`). Making sure the interaction utils aren't brittle may be a challenge since the way we test in RSP is with components in isolation versus other teams testing entire app flows that have many elements rendered at once. For instance, we can easily find the ListBox tied to a Select element by querying for `role="listbox"` in our RSP test, but doing so in a page filled with other ListBoxes would involve looking up the `id` from the Select's `aria-controls`.


## Backwards Compatibility Analysis

This is a backwards compatible change since no existing test utils are exposed from our library today.

## Alternatives

Unknown, haven't done research here yet.

## Open Questions

* What should be exposed as a test util vs documented? Since it will take a longer amount of time required to spin up the test util classes, should we expose the interaction util functions we already have even though they will be replaced by the test util classes?
* Where should these utils live? Exported from the monopackage as well? Or separated into its own test-util package? Re-exported from existing packages (react-aria-components, react-aria, react-spectrum)?
* Do we have a target version of `user-event` library? Right now we are on 12, but feels like we should move to 14 for broader pointer/keyboard support
* Feedback for test util classes: https://github.com/adobe/react-spectrum/pull/4836/files#diff-0dc4808158bbefa842fb382ea67f1b9cfa5f35f50496133afca79d908fc49209. Still a WIP as I poke around to get the actual listbox tied to the picker and add examples of other test util classes

## Help Needed

## Frequently Asked Questions

## Related Discussions

Original issue: https://github.com/adobe/react-spectrum/issues/3703. Many of the ideas discussed in this RFC were sources directly from the comments in the thread.
