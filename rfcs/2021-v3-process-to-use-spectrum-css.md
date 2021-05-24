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
- Authors: Rob Snow

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
We'd like for DNA updates to be easier to do, which should just be a new release of Spectrum-CSS.

## Detailed Design

<!--
   This is the bulk of the RFC.

   Explain the design with enough detail that someone familiar with React-Spectrum
   can implement it by reading this document. Please get into specifics
   of your approach, corner cases, and examples of how the change will be
   used. Be sure to define any new terms in this section.
-->

### Approaches

Wholesale vs incrementally. This should be a non-starter, we need to be able to do this incrementally as much as possible.

#### Chromatic
Before a component is moved over, we should make sure it's in Chromatic. This way we can test for visual regressions and be confident that we've consumed the new CSS correctly. This will also allow us to verify that we've contributed back our changes correctly. This will still have holes, but it will help. In addition, DSS may have a feature that all component states are top-leveled, allowing us to render every combination of states eventually.

#### CSS Modules:

##### Spectrum-CSS maintains all css packages
In this scenario, the Spectrum-CSS project adds two files to their distribution, a js file with the mapping of classnames to css module classnames and a css file that the js file imports. They can point to the js file using the main field of the package.json and can use styles to point to their css files. Spectrum-CSS is open to doing this. 

###### Pros:
  - Source of truth is Spectrum-CSS
  - We no longer provide our own separate copy bundle of the CSS
  - We are likely not blocked on several component we thought we'd have to maintain forever, Spectrum-CSS has already taken on grid in Dialog
  - Should Spectrum-CSS inadvertently break during a release, users of React Spectrum will be able to pin to earlier versions of Spectrum-CSS
  - Fixing CSS for the most part should still have the same turn around because they can test and release independent of us and our range dependency should still allow users to pick up the fix

###### Cons:
  - We may need to still distribute some of our own modularized css if there are things Spectrum-CSS cannot have from us
    - It may be that we just don't distribute those files
  - If we use any new features that Spectrum-CSS implements, we will need to update our packages to point to the new minimum version of the CSS that supports our component
  - Slower cycle to add new features that require CSS
  
##### RSP maintains css modules packages
Generate from node_modules in React Spectrum and publish as separate packages.

###### Pros:
  - Spectrum-CSS has to do less work
  - Should we inadvertently break CSS during a release, users of React Spectrum will be able to pin to earlier versions of our CSS packages

###### Cons:
  - A completely new package(s) for everyone
  - Wouldn't track with Spectrum-CSS updates, it'd always be behind
  - Local development would need to do it in postinstall so they'd be ready for use in storybook
  - If we use any new features that we implement in CSS, we will need to update our packages to point to the new minimum version of the CSS that supports our component

##### RSP maintains their own CSS packages
Everything stays the same but we publish our CSS

###### Pros:
  - Very fast to add new features
  - Spectrum-CSS doesn't have to do anything

###### Cons:
  - More confusing ecosystem
  - Diverge from Spectrum-CSS
  - More work for us, we'd be duplicating efforts of Spectrum-CSS at best


##### Spectrum-CSS and React Spectrum move into an even bigger monorepo

###### Pros:
  - No need to do local linking when trying to develop a new feature requiring CSS updates
  - Coordinated releases
  - Shared tooling

###### Cons:
  - Would set precedent for bringing in other groups to an already large repo
  - Work required to move into another repo for someone

#### DNA

There has been a breaking change to DNA, many tokens have changed. In addition, a script was run that changed our vars, so our vars don't look like Spectrum-CSS's vars. We will need to see if the script can be run again or if it's even something we want to keep.

##### Upgrade to 7.0 DNA first

###### Pros
  - There will be less to resolve when we start using Spectrum-CSS.

###### Cons
  - It would be more up front work that we'd need to do all at once before we could move to Spectrum-CSS. Probably we'd have a branch very similar to Spectrum-CSS'

##### Upgrade to 7.0 via move to Spectrum-CSS

###### Pros
  - Less up front work to getting on Spectrum-CSS.

###### Cons
  - We may have to support two versions of DNA at the same time. It would be susceptible to ordering 
  - would probably increase our overall library size while we're working on this.


#### DSS

This affects generation of Spectrum-CSS and token names. We will likely need to add some new classes. If we do have some components that we can't merge back to Spectrum-CSS, we'll need to decide if we keep using the Spectrum-CSS build tools to build our own

#### Use complete, partial, none
We will likely have three different kinds of components. Components where we can immediately switch to Spectrum-CSS, components where we will need to merge back some changes before we can switch completely over, and components that we will never be able to use spectrum-css for. After talking to Spectrum-CSS the worry about having some components we can never contribute back has diminished, as shown by them taking on Dialog's CSS changes over half a year ago.

##### Contributing back
In order to merge back the changes we've made, we'll need to go component by component and get guidance on if we should contribute the changes to Spectrum-CSS or directly into DSS.

##### Local overrides & new packages
Spectrum-CSS provides a whole tools packages that we can use to build our own CSS. Yarn/Lerna resolution will choose a local copy of a package over a remote one by the same name. We don't want to include CSS into our packages other than some minor bits like TableView has, so we'd need to publish any overrides. This would be confusing to the community, and a lot of work to maintain.
If we do have components that spectrum-css never wants, those we should publish ourselves.

With Spectrum-CSS potentially taking on CSS Modules, how do we want to handle local CSS such as TableView. Can these local files be contributed to Spectrum-CSS, or will they need to be published with the package as we currently do. I see this as low risk because we already apply both Spectrum-CSS and React-Spectrum-CSS selectors and Table, at least, isn't relying on variables nor creating any.

### Possible flow of work to move over

  - Add stories to Chromatic
  - At the same time, create branch to update DNA to 7.0
  - After DNA, begin moving over "easy" components to spectrum-css packages
    - Create a branch and run chromatic
    - Diff our CSS with Spectrum-CSS
    - Determine if we should contribute to Spectrum-CSS or DSS
    - Make branch to update appropriate module
    - Link locally, delete our local copy in spectrum-css-temp
    - Add any classes we need
    - Run chromatic
    - Verify results, repeating above steps until it passes
    - Submit branch as PR to spectrum and create a PR for React-Spectrum
    - Once Spectrum-CSS releases the package, merge PR in React-Spectrum
  - Continue moving components over

### Possible contribution back to Spectrum-CSS

  - Locally run Spectrum-CSS / DSS and link appropriate packages that need to be worked on
  - Make changes
  - When ready, submit changes as a PR to Spectrum-CSS / DSS
  - Once merged and released, submit PR to React Spectrum making sure to bump the version of each package depended on appropriately and merge
    - To define "appropriate", if the change included a new classname/selector/token we didn't have before
    - If it didn't have any of those, we don't need to release with a bump to the version

## Documentation

<!--
    How will this RFC be documented? Does it need a formal announcement to explain 
		the motivation?
-->
No formal announcement should be needed, npm should take care of installing new package dependencies when we change over. If people don't use the combined @adobe/react-spectrum package though, they may end up with some duplicate css, we should be able to cover this by updating all minimum package references for this release. We will need to add some documentation describing how we expect contributions and bugs concerning CSS to be carried out. We should be able to rely on Spectrum-CSS for information on what tokens are considered API for theming, though we should link to the appropriate place from our Styling docs.

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
It will be slower to make CSS updates should there be any bugs. In addition, it'll be more confusing to the community when they find a bug, we'll likely have a number of them reported against us that we'll need to re-report to Spectrum-CSS. This may also affect how willing someone is to work on a bug and contribute a fix. Especially with upcoming DSS which would be a completely new technology for nearly everyone.

## Backwards Compatibility Analysis

<!--
    How does this change affect existing React-Spectrum users? Will any behavior
    change for them? If so, how are you going to minimize the disruption
    to existing users?
-->
Our changes should not affect the existing users of React-Spectrum. They will now have access to the CSS packages we use and should see an overall application size reduction.
It will affect how people contribute back to React-Spectrum and our team will need to be good at forwarding bugs to Spectrum-CSS. We can also add to our Contributing docs to educate people on the difference, and maybe our Architecture page as well.

## Alternatives

<!--
    What other designs did you consider? Why did you decide against those?

    This section should also include prior art, such as whether similar
    projects have already implemented a similar feature.
-->
One alternative is to keep things the way they are. This is not great though as we will continue to drift from Spectrum-CSS leading to different experiences across Adobe which could be seen as a violation of our projects goals. In addition, it leads to a sub par user experience as we have duplicate code in packages leading to unneeded size bloat of our packages. In many ways, this would be the least disruptive answer, especially for our team.


Another alternative is to start publishing the CSS we have as packages and to start merging in Spectrum-CSS changes when they release. This would require a lot of manual labor and will only become harder with the arrival of DSS. This would require us to move ourselves to DSS so we can track with Spectrum CSS' changes instead of copying the output of DSS. This would mean more tools that we'd need to track versions of as well. It'd be a lot of manual labor to keep up with their changes as well and determine how they fit with our divergence. This assumes that we don't take an active role contributing back.



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

We'll need Spectrum-CSS' help in order to include CSS modules in Spectrum-CSS' packages. We'll also need their help merging back many of our changes.
People within our own team will need to champion the various components where they've done a lot of the CSS changes. That way we don't forget bugs that we've solved by doing something in a particular way. As domain experts on those components, they will be the best chance we have at avoiding regressions.

## Frequently Asked Questions

<!--
    This section is optional but suggested.

    Try to anticipate points of clarification that might be needed by
    the people reviewing this RFC. Include those questions and answers
    in this section.
-->

When will DSS actually be prime time ready?
What timeline are going to work with here?
Size comparison current Spectrum-CSS vs DSS output

## Related Discussions

<!--
    This section is optional but suggested.

    If there is an issue, pull request, or other URL that provides useful
    context for this proposal, please include those links here.
-->
