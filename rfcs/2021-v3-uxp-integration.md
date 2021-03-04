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

### UXP Implementation per module

For every @react-spectrum module which needs a modified implementation of one or more components for UXP we will do the following:

- Create a new folder and UXP specific entry point: `./src/uxp/index.ts`.
    - Has the same export API as `./src/index.ts`.
    - Re-exports any components that do not need to be modified from `./src/index.ts`.
    - If running on UXP (determined at runtime) exports UXP specific components as needed.
- Modify `./package.json` and add a new parcel build target that will enter at `./src/uxp/index.ts` and output at `./dist/uxp.js`

### UXP Storybook for developers

UXP Developers will need a convenient way to author and test UXP components with hot module reloading (HMR). We propose adding a UXP compatible storybook plugin to the repository at `./packages/uxp/storybook`.

This new package will:

- Leverage the pre-existing `./stories` files for each module.
- Build a plugin that can be viewed in:
    - a web browser
    - the UXP demo application
    - a plugin environment like XD
- Provide hot module reloading for all clients.

### UXP Consumption of React-Spectrum components

UXP clients will use the `./dist/uxp.js` entry point which will be compiled and published automatically via the current build/publish process.

We intend to provide both parcel and webpack plugins that simplify the consumption of the UXP specific entry point. Details of both are open questions.

### UXP Development process

In order to streamline review process and avoid undue burden on core react-spectrum developers, we propose making UXP team architects code owners over the react-spectrum `./packages/uxp` folder and corresponding `./packages/*/*/src/uxp` folders for each relevant module.

The currently existing PR tests will ensure that uxp specific targets are always built successfully.

No changes within the uxp specific folders can have any effect upon the current browser specific modules.

### Sample Implementation of basic Storybook and UXP Button

https://github.com/adobe/react-spectrum/compare/main...krisnye:monorepo?expand=1

## Documentation

There will be a README.md included in a uxp specific package.

## Drawbacks

The presence of new UXP specific folders will increase complexity of the repository and build time.
Contributors without a UXP environment won't be able to test any changes that impact UXP.

## Backwards Compatibility Analysis

We will not be changing any public API's or currently existing entry points into packages.
No behavior should change for web based consumers.
UXP users will need to use a parcel/webpack plugin to bundle the correct new UXP entry points.

## Alternatives

1. Use an external package as the UXP entry point.
    + No dependence on react-spectrum team and processes.
    - More packages to publish and consume.
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

## Help Needed

Once code ownership over UXP directories is granted, no further significant help is expected to be needed.

## Frequently Asked Questions

## Related Discussions
