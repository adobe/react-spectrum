<!-- Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2026-10-03
- RFC PR:
- Authors: Minwook Shin, with assistance from Codex (GPT-6)

# Extensible collection keyboard navigation through delegates

## Summary

Add an optional event-resolution method to collection keyboard delegates. It returns a navigation or selection intent, which `useSelectableCollection` applies through its existing state and focus machinery. A shared base class supplies standard bindings, while an adapter preserves compatibility with structural delegates and Virtualizer layouts. This is a design proposal for #6839, not an implementation or a change to default keyboard behavior.

## Motivation

[The discussion in #5812](https://github.com/adobe/react-spectrum/pull/5812#issuecomment-2050642222) proposed moving keyboard customization into delegates rather than adding another handler map to `useSelectableCollection`. Applications could extend one action while retaining the library's geometry, disabled-item handling, selection, and scrolling.

The current implementation has since moved to `useKeyboard({shortcuts})`. Reintroducing the earlier `onKeyDown` switch would duplicate shortcut matching and lose its composition, repeat, and propagation behavior. The extension needs to fit this implementation and the separately composed typeahead handlers.

## Detailed Design

### Resolve intent separately from applying it

Keep the current geometric methods on `KeyboardDelegate`, including `getKeyBelow`, `getKeyRightOf`, and `getKeyForSearch`. Add an optional `getActionForKeyboardEvent(event, context)` method. The names below are proposed, not existing exports:

```ts
type CollectionKeyboardAction =
  | {
      type: 'navigate';
      key: Key;
      childFocusStrategy?: FocusStrategy;
      selection: 'followFocus' | 'preserve' | 'replace' | 'extend';
    }
  | {type: 'selectAll'}
  | {type: 'clearSelection'}
  | {type: 'leaveCollection'; direction: 'forward' | 'backward'};

type KeyboardActionResult = CollectionKeyboardAction | null | undefined;
```

The method receives the focused key, direction, wrapping setting, and read-only selection settings. It must not receive the selection manager or DOM refs merely to mutate them. Delegates resolve targets and intent; the hook owns focus, router navigation, selection, scrolling, and browser-event effects.

Return values have distinct meanings:

- `undefined`: no override; use the standard binding or typeahead behavior.
- `null`: consume this binding without moving focus or changing selection.
- An action: apply it once through the collection hook. Numeric key `0` remains valid.

`followFocus` uses the hook's existing focus/selection policy. `preserve`, `replace`, and `extend` express the different intentions of non-contiguous navigation and Home/End combinations. The hook still enforces selection mode, disabled behavior, link behavior, and restrictions such as `disallowSelectAll` and `disallowEmptySelection`; an action cannot bypass these options.

A navigation action goes through `navigateToKey`, extended only as needed to express the existing boundary-key selection policy. `leaveCollection` reuses the current Tab handling, including tabbable children and native browser traversal. It must never prevent Tab merely because a delegate returned that action. Event cancellation and propagation remain the hook's decision, including cases where navigation declines to handle a link.

### Shared base and existing delegates

Introduce a `BaseKeyboardDelegate` with the standard event-to-action resolver and protected geometry-resolution methods. `ListKeyboardDelegate` and `GridKeyboardDelegate` implement those methods using their existing geometry. A subclass can override one binding and defer all other events to the base resolver.

Do not force every existing object to extend this class. Old structural delegates continue to satisfy `KeyboardDelegate`; a default adapter resolves standard actions using their existing optional methods. Missing horizontal methods must retain their meaning for vertical lists and drag-and-drop. A method returning `null` at a boundary is different from a method being absent.

Virtualizer layouts already have an inheritance hierarchy. Wrap their geometry in the same adapter instead of changing that hierarchy or copying layout state. The adapter must always read the current layout, collection, and focused key, including offscreen items after a collection update.

### Event ordering

Use the shortcut matching already used by `useKeyboard`, including platform modifiers. Do not implement a second key-string parser or synthesize an Arrow key event for a custom binding. Repeated navigation remains allowed; Home/End and other non-repeating bindings keep their current policy.

Before invoking an override, preserve the existing portal and composition guards. An event handled by an editable descendant or another collection must not become a collection shortcut. Custom handlers do not get access to IME composition events by default.

Resolve a custom binding before adding its characters to the typeahead buffer. A handled binding must not also select an item by text. Unhandled bindings retain typeahead, including its special capture-phase Space handling. Space and item activation share event ordering, so this interaction needs an explicit prototype and agreement before a public API is finalized; globally moving all collection handling into capture is not proposed.

## Documentation

Document this as an advanced hook-level extension, not a new default interaction for every RAC component. Start with adding a shortcut alongside standard navigation, then show overriding one action with an explanation of the accessibility responsibility. Describe all three result states, repeated keys, modifiers, typeahead, editable descendants, and virtual focus.

The [APG keyboard guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) emphasizes predictable conventions and separating focus from selection. Keep the existing [listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) and [grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) interactions by default. Applications adopting custom bindings must document them and check conflicts with assistive technology and browser shortcuts.

## Drawbacks

This adds a public contract across multiple layers. A raw key alone cannot describe Home/End selection, grid child focus, or Tab traversal, but an overly general action language would expose collection internals. The proposal deliberately excludes arbitrary state callbacks, changing the selection manager, and replacing the whole focus system.

Keyboard overrides can make familiar widgets harder to operate. Reusing geometry does not make an unconventional interaction accessible by itself. Browser and screen-reader validation remains necessary for applications choosing such behavior.

## Backwards Compatibility Analysis

Start with an optional method and the structural-delegate adapter. Migrate List, Grid, and Virtualizer separately, with equivalent behavior tests before removing the old paths. Do not require new constructor arguments or convert optional geometry methods into required methods on the public interface.

Before an implementation is ready, verify:

- Default list, grid, table, tree, combobox, and drag-and-drop interactions.
- Single/multiple selection, disabled items, links, empty collections, and a focused item being removed.
- Home/End with platform modifiers, Shift extension, wrapping, repeated keys, Tab, and Shift+Tab.
- LTR/RTL, horizontal lists, grid child focus, virtual focus, and offscreen Virtualizer targets.
- Custom bindings that navigate, deliberately do nothing, or fall back, including key `0`.
- Typeahead and Space, IME composition, portals, nested collections, and editable descendants.

These are implementation acceptance criteria, not results claimed by this RFC.

## Alternatives

- **Handler maps on `useSelectableCollection`:** the approach explored in #5812; it duplicates responsibility already assigned to delegates.
- **An optional method without a base class:** a smaller first step, but consumers must reconstruct default bindings when overriding an existing action. It may be useful for the initial experiment.
- **Require every delegate/layout to inherit a new class:** simpler dispatch, but breaks structural delegates and conflicts with Virtualizer's existing hierarchy.
- **Remap events to synthetic Arrow/Home/End events:** appears small, but couples customization to event mutation and risks losing modifiers, propagation, and child-focus semantics.

## Open Questions

1. Should the first implementation support navigation only, or also selection and Tab intents? The latter preserves a single extension point but makes the contract larger.
2. Should a custom Space binding override collection typeahead only, or also item activation? Which layer owns that priority?
3. Should the adapter/base class be exported immediately or remain internal until List and Virtualizer compatibility is established?

## Help Needed

Maintainer feedback on the result contract and event priority would establish the scope for a List prototype and Virtualizer compatibility tests before migrating the other delegates.

## Related Discussions

- [Selectable Collection keyboardDelegates, #6839](https://github.com/adobe/react-spectrum/issues/6839)
- [Earlier handler override experiment, #5812](https://github.com/adobe/react-spectrum/pull/5812)
- [Current collection handler](../packages/react-aria/src/selection/useSelectableCollection.ts)
- [Current keyboard shortcut handler](../packages/react-aria/src/interactions/useKeyboard.ts)
- [Typeahead handling](../packages/react-aria/src/selection/useTypeSelect.ts)
- [Public structural delegate interface](../packages/@react-types/shared/src/collections.d.ts)
