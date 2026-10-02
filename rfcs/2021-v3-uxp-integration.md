<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2021-02-22
- RFC PR:
- Authors: Kris Nye

# UXP Integration

## Summary

This feature will provide a pattern that we can follow to integrate UXP specific components into the repository and build process. More generally it will describe an approach for providing environment specific overrides for one or more components.

## Motivation

We need to provide React Spectrum compliant components that run on UXP including both plugin environments and Adobe internal projects. When complete a user should be able to import this repository and build applications that run both in modern web browsers and on UXP with the same source code. Some bundling configuration may be required to support bundle-time selection of UXP specific components.

## Detailed Design

UXP = Unified Extensibility Platform. This platform is used both internally by Adobe and also public plugins for Adobe products including XD.

### UXP Specific React Spectrum Organization

We will create a new @react-spectrum-uxp organization at npmjs.com in order to provide a namespace for all of our UXP specific react-spectrum modules.

Our UXP implementations will have the same name as the react-spectrum modules they replace but be hosted within our new namespace. For example our implementation of `@react-spectrum/button` will be at `@react-spectrum-uxp/button`.

### UXP Implementation per module

For every @react-spectrum module which needs a modified implementation of one or more components for UXP we will do the following:

- Create a new corresponding project at `packages/@react-spectrum-uxp/[name]`.
- Implement UXP compatible versions of relevant components.
- Has the same export API as `packages/@react-spectrum/[name]`.
- Re-exports any components that do not need to be modified from `packages/@react-spectrum/[name]`.
- If running on UXP exports UXP specific components as needed.
- If running on web re-exports base implementations.
- It may be possible to use package.json conditional exports to determine correct entry at bundling time otherwise it will be determined at runtime.

### UXP mono-package for consumers

We will create a new package at `packages/@adobe/react-spectrum-uxp` that has the same API and exports as `packages/@adobe/react-spectrum` but exports our UXP specific components where needed and simply re-exports any base components that need no changes.

This package will be published on npmjs.com as `@adobe/react-spectrum-uxp`.

### UXP Storybook for developers

UXP Developers will need a convenient way to author and test UXP components with hot module reloading (HMR). We propose adding a UXP compatible storybook plugin to the repository at `packages/@react-spectrum-uxp/storybook`.

This new package will:

- Leverage the pre-existing `./stories` files for each module.
- Build a plugin that can be viewed in:
    - a web browser
    - the UXP demo application
    - a plugin environment like XD
- Provide hot module reloading for all clients.
- Be marked private and not published to npmjs.

### UXP Consumption of React-Spectrum components

UXP clients will simply modify their existing `@adobe/react-spectrum` import and change it to `@adobe/react-spectrum-uxp`. This can also be done with aliasing in most bundlers so that no source code needs to be changed.

We may provide plugins for both parcel and webpack that simplify consumption if needed, but the usage of conditional exports may make this unnecessary.

### UXP Development process

In order to streamline review process and avoid undue burden on core react-spectrum developers, we propose making UXP team architects code owners over the react-spectrum-uxp folder `packages/@react-spectrum-uxp` and the mono-package folder `./packages/@adobe/react-spectrum-uxp`.

The currently existing PR tests will ensure that uxp specific targets are always built successfully.

No changes within the uxp specific folders should have any effect upon the current browser specific modules.

Backwards incompatible/breaking changes to react-spectrum module API's may cause compile errors in corresponding UXP projects. If this happens then the react-spectrum core developer can fix the type errors and should add a UXP team member such as myself to the review process.

### Sample Implementation of basic Storybook and UXP Button

https://github.com/adobe/react-spectrum/compare/main...krisnye:monorepo?expand=1

## Drawbacks

The presence of new UXP specific modules will increase complexity of the repository and build time.
Contributors without a UXP environment won't be able to test any changes that impact UXP.

## Backwards Compatibility Analysis

We will not be changing any public API's or currently existing entry points into packages.
No behavior should change for web based consumers.
UXP users will need to use a parcel/webpack plugin to bundle the correct new UXP entry points.

## Alternatives

1. Use an external package as the UXP entry point.
    + No dependence on react-spectrum team and processes.
    - Harder to keep UXP API in sync with standard API.
    - Duplicating type systems and build processes for little gain.
    - Contributors gain less knowledge of react-spectrum since not working within it's repository.
    - core contributors won't know via type system if/when they break a uxp dependency.

2. Integrate UXP specific components at runtime.
    + Easy for consumers as they need no extra bundling configuration.
    - Will add size to all bundles whether they consume UXP or not.

## Open Questions

How do we configure Parcel bundling for UXP?

How do we configure Webpack bundling for UXP?

How do we add any tests that require a UXP environment?

Will package.json conditional exports handle importing UXP vs web entry points?

## Help Needed

Once code ownership over UXP directories is granted, no further significant help is expected to be needed.

## Frequently Asked Questions

## Related Discussions
