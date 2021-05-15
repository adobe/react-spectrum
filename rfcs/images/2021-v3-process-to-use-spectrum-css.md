<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: (fill me in with today's date, YYYY-MM-DD)
- RFC PR: (leave this empty, to be filled in later)
- Authors: (the names of everyone contributing to this RFC)

# Process to get back to Spectrum CSS

## Summary

<!-- One-paragraph explanation of the feature. -->
React Spectrum has been on a copy of Spectrum-CSS since we started work on v3. This was originally due to needing to perform redesigns quickly and Spectrum-CSS not quite being in a place where we could easily use it and update it. Spectrum-CSS moved to individual component packages between then and now, making it much easier for us to consume their packages. At that point, we had diverged from their implementation though, making the task of actually using them much harder. This document aims to outline a plan for getting us back on Spectrum-CSS.

## Motivation

<!-- Why are we doing this? What use cases does it support? What is the expected
outcome? -->

We would like to use Spectrum CSS so that we do not maintain a duplicate and diverging copy of Spectrum-CSS.
Right now we are very far behind on DNA as well, and we use a structure for our CSS that now differs from how Spectrum-CSS has organized.
We'd like to benefit from their work on the Express theme and T-shirt sizes, this will help us support future themes as well.
We'd like to not bundle CSS with our components so that users of our library only get one copy of a components CSS in their code.
This isn't just for external users, we've run into this ourselves in our documentation website.
We'd also like for others to benefit from the work that we've done on CSS since we originally forked.

## Detailed Design

<!--
   This is the bulk of the RFC.

   Explain the design with enough detail that someone familiar with React-Spectrum
   can implement it by reading this document. Please get into specifics
   of your approach, corner cases, and examples of how the change will be
   used. Be sure to define any new terms in this section.
-->

### Approaches
work in progress area
Wholesale vs incrementally. This should be a non-starter, we need to be able to do this incrementally.

#### Chromatic
Before a component is moved over, we should make sure it's in Chromatic so we can test for visual regressions and be confident that we've consumed the new CSS correctly.

#### CSS Modules:

Generate in Spectrum-CSS project, add to dist.

##### Pros:
  - Source of truth is Spectrum-CSS
  - We no longer provide our own separate copy bundle of the CSS

##### Cons:
  - We may need to still distribute some of our own modularized css if there are things Spectrum-CSS cannot have from us
    - It may be that we just don't distribute those files
  

#### DNA
  fill in

#### DSS
  fill in

#### Use complete, partial, none
We will likely have three different kinds of components. Components where we can immediately switch to Spectrum-CSS, components where we will need to merge back some changes before we can switch completely over, and components that we will never be able to use spectrum-css for.



## Documentation

<!--
    How will this RFC be documented? Does it need a formal announcement to explain 
		the motivation?
-->

## Drawbacks

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

<!--
    How does this change affect existing React-Spectrum users? Will any behavior
    change for them? If so, how are you going to minimize the disruption
    to existing users?
-->

## Alternatives

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
