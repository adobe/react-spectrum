<!-- Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2025/1/28
- RFC PR: Exploration PRs: https://github.com/adobe/react-spectrum/pull/6046
- Authors: Rob Snow

# Improving React Aria Shadow DOM Support

## Summary

This RFC outlines a plan for progressive enhancement of Shadow DOM support across React Aria, React Aria Components, and React Spectrum S2. “Shadow DOM support” can mean many things: it spans open versus closed shadow roots, a single containing shadow root versus many per-component roots, and interaction with third-party encapsulation. The work described here is intended to improve behavior across these scenarios where feasible.

## Motivation

As Shadow DOM is used by more libraries and applications, users have encountered friction trying to adopt or use our libraries. Reported issues include incorrect focus management, broken overlay and press behavior, and `ariaHideOutside` misbehavior when trees cross shadow boundaries.

Representative issues:

- [Dialog focus management with third-party dialogs](https://github.com/adobe/react-spectrum/issues/5314)
- [Video controls and FocusScope](https://github.com/adobe/react-spectrum/issues/6729)
- [FocusScope inside `shadowRoot`](https://github.com/adobe/react-spectrum/issues/1472)
- [`ariaHideOutside` inside shadow DOM](https://github.com/adobe/react-spectrum/issues/6133)
- [`usePress` in `shadowRoot`](https://github.com/adobe/react-spectrum/issues/2040)
- [`useOverlay` click-outside in shadow DOM](https://github.com/adobe/react-spectrum/issues/3970)

Prior contributions have addressed subsets of these problems. We are looking for a solution that is maintainable, integrates cleanly with day-to-day development, and reduces reliance on ad hoc workarounds.

## Detailed Design

As mentioned earlier, there are proposed parts to this initiative:

### 1. Testing

Tests will be net new. This is the biggest body of needed work. Without it, we don't know what we are supporting and we can't catch regressions.

**Tooling:** [`shadow-dom-testing-library`](https://github.com/KonnorRogers/shadow-dom-testing-library) may supplement or replace certain Testing Library utilities where shadow-aware queries are required.

**Custom renderer (alternative considered):** A React Testing Library renderer that wraps each test’s output in a shadow root—analogous to the existing StrictMode test setup—would provide a strong baseline. An initial exploration ([comparison branch](https://github.com/adobe/react-spectrum/compare/get-tests-running-in-shadowdom?expand=1)) indicated that wholesale migration of existing tests is impractical due to API assumptions and volume of failures.

### 2. Avoid DOM Traversal/Manipulation

FocusScope and collection-related code currently traverse the DOM to assign and contain focus (e.g., dialogs, roving tabindex). Prefer deferring tab order to the browser where possible.

A promising direction is to reason about stacking context / focus escape so that focus is intercepted only when it would leave the intended scope for an invalid destination. This stops watching the Tab key completely. Exploration exists in [PR #8796](https://github.com/adobe/react-spectrum/pull/8796).

**Alternative (sentinel nodes):** Placing focusable sentinels to trap focus could reduce custom traversal and may help with closed shadow roots (e.g., native video controls inside a dialog). This remains a candidate if the stacking-context approach is insufficient.

### 3. Scoped listeners and observers

Global listeners and `MutationObserver` (and similar) do not observe inside shadow roots by default. Consequences include missed or misattributed events: for example, focus and blur do not bubble across shadow boundaries except when focus enters or exits the root; child-list observers do not see mutations inside descendant shadow trees.

Attach listeners and extend observers to relevant shadow roots where the implementation currently assumes a single document subtree. Fixes are expected to be contextual rather than one universal abstraction.

### 4. In-team Education

Writing code that can handle the prescence of Shadow DOM can be tricky. As a result, there will be a learning curve for the team.

ShadowDOM safe code requires discipline. Two mechanisms are proposed:
- **Shared utilities** encapsulating shadow-aware behavior (e.g., active element, event target, tree walking, containment checks).
- **Lint rules** to flag unsafe patterns and suggest utilities.

Illustrative mappings:
| Unsafe / naive pattern | Preferred utility-oriented pattern |
|------------------------|-----------------------------------|
| `document.activeElement` | `getActiveElement()` (shadow-aware) |
| `e.target` | `getTargetElement(e)` |
| `document.createTreeWalker(...)` | `createShadowTreeWalker(...)` |
| `e.currentTarget.contains(e.target)` | `nodeContains(e.currentTarget, getEventTarget(e.nativeEvent))` |

### 5. Communication

We have our current Shadow DOM support gated behind a feature flag to both signal that it is experimental as well as to protect users who are not using any Shadow DOM from possible performance hits.

We will want to expand this to also shield those users from code size increases. This could be accomplished with a global registry for the utility functions we provide that would replace the feature flag system we have for it right now.

We also need to communicate, through documentation, what the specifics are of our Shadow DOM support since we likely will not be able to support everything, and certainly not much for a while.

For example, some of our support may require open root Shadow DOMs. Or someone using our FocusScope's focus manager may need to know about different traversal methods to avoid the same issues we are trying to avoid.

## Drawbacks

One concern is on-going support. Internal use cases do not heavily exercise Shadow DOM today; team expertise is limited. Reliance on automated tests is necessary because Shadow DOM is not a focus for the team.

External contributions may taper once immediate needs are met; the maintainers should assume responsibility for completing the goals in this RFC.

Current mitigations interact with shadow trees in ways that are not always aligned with encapsulation as originally envisioned. Future API redesigns might prefer different models; present choices could complicate migration.

## Backwards compatibility

This is a backwards compatible change, we should just be extending functionality, not breaking any of it.


## Open questions

1. **Support matrix:** How should supported versus unsupported Shadow DOM configurations be defined and documented (open vs. closed, single vs. multiple roots)?
2. **Test environment:** `user-event` and JSDOM have known shadow DOM gaps ([e.g. user-event #1026](https://github.com/testing-library/user-event/issues/1026)); what is the long-term testing strategy if upstream fixes are slow?
3. **Scope:** Should changes apply to React Spectrum v3, or only to React Aria Components and S2 going forward?

## Request for community input

The highest-value contributions are tests: unit tests or minimal reproductions derived from real applications that can be turned into permanent fixtures. Additional coverage directly reduces regression risk after the initial implementation phase.

## Frequently asked questions

**How much can the project rely on contributor maintenance after merge?**
Maintainers should treat contributed code as owned by the project. ESLint and shared utilities reduce the cost of keeping patterns consistent.

**Do users who never use Shadow DOM benefit?**
Yes. Several reported bugs involve shadow trees introduced by third parties or by native elements (e.g., video controls inside dialogs). Consumers may be unaware that shadow DOM is in play.

## Related discussions

- Original exploration: [feat: Focus Management within ShadowDOM](https://github.com/adobe/react-spectrum/pull/6046)
- [Known remaining issues (project board)](https://github.com/orgs/adobe/projects/19/views/32?pane=issue&itemId=157309187)
