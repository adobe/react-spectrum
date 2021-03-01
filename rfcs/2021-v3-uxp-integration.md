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

<!--
   This is the bulk of the RFC.

   Explain the design with enough detail that someone familiar with React-Spectrum
   can implement it by reading this document. Please get into specifics
   of your approach, corner cases, and examples of how the change will be
   used. Be sure to define any new terms in this section.
-->

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
