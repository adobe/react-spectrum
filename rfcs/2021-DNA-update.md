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

# Upgrade to DNA 7

## Summary

<!-- One-paragraph explanation of the feature. -->
This RFC entails the work needed to upgrade us from our custom vars to `@spectrum-css/vars`. It will outline
how to install it, how to move components to the new tokens, what to do when a bug is found in the new DNA version,
and how to build our components with the new tokens, both Parcel and Webpack.

## Motivation

<!-- Why are we doing this? What use cases does it support? What is the expected
outcome? -->
We need to upgrade our version of DNA so that any future decisions we make about Spectrum-CSS are easier.
This will give us a chromatic baseline for our CSS work plus any colors or sizes that DNA has changed or added.
This will make it easier to enact any plans for Spectrum-CSS, including transitioning our changes back or moving off
to consume DSS directly. The expected outcome is that we use the current values that Design has specified for Spectrum
and we limit our testing surface area to size and color and we do not include behavior.
Finally, this gets us closer to supporting t-shirt sizes.

## Detailed Design

<!--
   This is the bulk of the RFC.

   Explain the design with enough detail that someone familiar with React-Spectrum
   can implement it by reading this document. Please get into specifics
   of your approach, corner cases, and examples of how the change will be
   used. Be sure to define any new terms in this section.
-->
First we'll start a branch that has a dependency on the last `@spectrum-css/vars` with DNA 7.
Next, we can work on individual components on branches based on this one. You can see the changes I made to
Checkbox's css in this branch https://github.com/adobe/react-spectrum/compare/prototype-dna-upgrade?expand=1.


The easiest changes we can make are change over all tokens to use the 'm' or medium t-shirt size.
This will match our current sizes for everything.


There will be some bugs, we'll need to look into them as we find them. So far most of them have been what I
believe to be errors in DNA, not in DSS or CSS.
Some class names may need updating as well, see the Icons css in that same branch. Open question about renaming.
We do have some comments in our code for patches/fixes since we couldn't easily update DNA.
If we come across one of these, we should do our best to fix it where it comes from.


There are some CSS files that are shared across components, people working on a component should address those
as needed and try to get them merged to the upgrade branch early so that we don't duplicate that effort.
Again, see the branch link above, there are things like font, icons, typography, that need to apply to many
components.

## Documentation

<!--
    How will this RFC be documented? Does it need a formal announcement to explain 
		the motivation?
-->
This change should be fairly minor as far as work and use go. If there is a DNA bug though, it may be
harder for a contributor or one of us to fix and may take longer.

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
There is a chance that we'll let some DNA bugs through.

## Backwards Compatibility Analysis

<!--
    How does this change affect existing React-Spectrum users? Will any behavior
    change for them? If so, how are you going to minimize the disruption
    to existing users?
-->
This should result in no changes to existing users of React-Spectrum.

## Alternatives

<!--
    What other designs did you consider? Why did you decide against those?

    This section should also include prior art, such as whether similar
    projects have already implemented a similar feature.
-->

We could do this as part of a wholesale upgrade to move back to Spectrum-CSS or move off and straight to DSS,
but given we haven't made that decision this is an easier move with less surface area that lets us find any issues with
DNA ahead of time.

## Open Questions

<!--
    This section is optional, but is suggested for a first draft.

    What parts of this proposal are you unclear about? What do you
    need to know before you can finalize this RFC?

    List the questions that you'd like reviewers to focus on. When
    you've received the answers and updated the design to reflect them, 
    you can remove this section.
-->
We'll need to determine if it is enough to just have a dependency on `@spectrum-css/vars`
or if we need to copy that package into our temp directory so that Parcel can build with it.
Do we want to change the ui icon class names?

## Help Needed

<!--
    This section is optional.

    Are you able to implement this RFC on your own? If not, what kind
    of help would you need from the team?
-->
There are too many components for one person, it'd be easiest to break up the repo and farm it out to everyone on the team.
We'll also need a testing session afterwards focused on size and color, chromatic can hit a lot, but not everything, particularly
around focus/hover/active.
We'll likely want someone from design who can answer questions if something is intentional or a bug.

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
