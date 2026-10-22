<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2026-10-22
- RFC PR: (leave this empty, to be filled in later)
- Authors: Travis Cory

# Render form element within ToggleButton for form support

## Summary

Add an input to the toggle button that is hidden from sighted users and screen readers. This input will allow consumers to integrate the ToggleButton into forms and effectively change it into a checkbox or radio input based on the selection mode.

## Motivation

The desire is for users to be able to use the ToggleButton within a form context if they desire. The toggle button takes on the role radiogroup when it is rendered within with the selection mode of single. 

## Detailed Design

<!--
   This is the bulk of the RFC.

   Explain the design with enough detail that someone familiar with React-Spectrum
   can implement it by reading this document. Please get into specifics
   of your approach, corner cases, and examples of how the change will be
   used. Be sure to define any new terms in this section.
-->

Update ToggleButton.tsx so that in addition to the button that is [rendered](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/ToggleButton.tsx#L128) a hidden input is also rendered. This input takes on the current checked value based on isSelected. The type is determined by selection mode at the ToggleButtonGroup component, and the ToggleButton is updated to support form, name, and value. If it is rendered within ToggleButtonGroup, the form and name prop from the ToggleButtonGroup win out over the ToggleButton props. The idea being that using these form values are entirely opt in, and most use cases do not need to worry about the additional input. In theory, we could only render the input when form and/or name are provided.

## Documentation

<!--
    How will this RFC be documented? Does it need a formal announcement to explain 
		the motivation?
-->

## Drawbacks

The ToggleButton has a stated purpose of, "A toggle button allows a user to toggle a selection on or off, for example switching between two states or modes." It might be considered a bad use of the pattern of the component to allow forms to know what the current value is.

<!--
    Why should we *not* do this? Consider why adding this into React-Spectrum
    might not benefit the project or the community. Attempt to think 
    about any opposing viewpoints that reviewers might bring up. 

    Any change has potential downsides, including increased maintenance
    burden, incompatibility with other tools, breaking existing user
    experience, etc. Try to identify as many potential problems with
    implementing this RFC as possible.
-->

## Backwards Compatibility Analysis
Existing users will inherit this new behavior but the form logic is effectively opt-in or a nice bonus.
<!--
    How does this change affect existing React-Spectrum users? Will any behavior
    change for them? If so, how are you going to minimize the disruption
    to existing users?
-->

## Alternatives
Another possibility is a bespoke radio or checkbox with the toggle button UX. For simplicity, our team decided to explore building on top of the toggle button and propose building it into the core component. 

<!--
    What other designs did you consider? Why did you decide against those?

    This section should also include prior art, such as whether similar
    projects have already implemented a similar feature.
-->

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
I am able to implement this into the component!
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