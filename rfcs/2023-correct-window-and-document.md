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
- Authors: Samuel Lye

# Improving React Spectrum test writing experience

## Summary

This RFC proposes improvements to the @react-aria/focus and @react-aria/interactions libraries, particularly around support for iframes when used in combination with React.createPortal. The changes focus on using the correct document and window object. For example, if portalling a React node from the main window to an iframe or from an iframe to another iframe, we should be using the correct document and window object, i.e. that of the iframe, instead of the source frame. This is because the javascript context still runs on the source frame when using React.createPortal. This does not change existing behavior.

## Motivation

Stripe is building embeddable UI components, which adopt the look and feel of the page that they are rendered in. We currently use iframes to prevent cross-origin communication from the page that the UI components are embedded on. Stripe's design system utilizes many of React Spectrum's packages, for instance @react-aria/focus and @react-aria/interactions. However, we have found issues with using these packages when integrating with iframes. There are several existing issues filed by other developers:
- Use the correct ownerDocument: https://github.com/adobe/react-spectrum/issues/4634
- FocusScope: https://github.com/adobe/react-spectrum/issues/3350
- onPress: https://github.com/adobe/react-spectrum/discussions/2237

## Detailed Design

A fix to these issues is to use the correct `document` and `window` object in `FocusScope`, `usePress`, and `useInteractOutside`. 

We add a utility function in `@react-aria/utils` that accepts a HTMLElement argument and returns the corresponding `ownerDocument` and `ownerWindow`. 

## Documentation

N/A.

## Drawbacks

N/A. We return the original `document` and `window` object if the HTMLElement argument is null, which maintains existing behavior.

## Backwards Compatibility Analysis

N/A.

## Alternatives

We were looking at patching the NPM packages on our end but realized that the wider community was also facing similar issues. We also want to use the most up-to-date react-spectrum version, therefore we decided to contribute back to the package.

## Open Questions

<!--
    This section is optional, but is suggested for a first draft.

    What parts of this proposal are you unclear about? What do you
    need to know before you can finalize this RFC?

    List the questions that you'd like reviewers to focus on. When
    you've received the answers and updated the design to reflect them, 
    you can remove this section.
-->

## Help Needed

<!--
    This section is optional.

    Are you able to implement this RFC on your own? If not, what kind
    of help would you need from the team?
-->

## Frequently Asked Questions

<!--
    This section is optional but suggested.

    Try to anticipate points of clarification that might be needed by
    the people reviewing this RFC. Include those questions and answers
    in this section.
-->

## Related Discussions

<!--
    This section is optional but suggested.

    If there is an issue, pull request, or other URL that provides useful
    context for this proposal, please include those links here.
-->
