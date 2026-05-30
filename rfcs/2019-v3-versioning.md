<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2019-02-26
- RFC PR: (leave this empty, to be filled in later)
- Authors: Devon Govett

# React Spectrum v3: Component Versioning

## Summary

React Spectrum has historically been published as a single monolithic package to artifactory. While this is very convenient for users and has made it easy to coordinate versions of components, there have been some cases where individually versioning components makes sense, such as when breaking changes are made or users wish to try out beta features before they are ready. In this RFC, we propose splitting each component into its own individually versioned npm package in order to support those cases, while still maintaining a stable and version coordinated monolith package.

## Motivation

The current monolithic `react-spectrum` package has generally worked quite well for us. Each component is available as a sub-directory of that package, e.g. `react-spectrum/Button`. This guarantees that the versions of every component are synchronized, which is important for visual consistency. It also prevents bugs related to multiple versions of the CSS clobbering each other. In addition, having only a single dependency in react-spectrum applications is much simpler than managing separate dependencies for each component.

However, there have been some challenges associated with this monolithic package.

### Breaking Changes

Because every component is available in a single package, it is quite difficult to make breaking changes to components. This includes API changes, along with breaking design changes. If a breaking change is made to a single component, perhaps for a single client, the entire `react-spectrum` package needs to be bumped to the next major version. Upgrading major versions can be a very time consuming process for users of react-spectrum, so we generally try to avoid doing this. This means that breaking changes to components must be held off until the next major version for all components, and we must maintain backward compatibility for every change we make. This can be frustrating for users that need the breaking change, and for the design team who want to improve the design in a breaking way but are held back from doing so.

### Betas and precursors

The `react-spectrum` package is expected to be very stable by clients. When a non-trivial new feature is added to a component, or a new component is being developed, we often like to release beta versions so that clients can test out the new feature or component before it is released into the stable version of `react-spectrum`. However, it is currently quite challenging to maintain beta versions and stable releases simultaneously. It requires releasing from multiple beta branches, and attempting to keep changes to stable components up to date in beta release versions.

In addition, the Spectrum design team has many “precursor” components, which are initial versions of components that do not yet have a stable design. It is important to the design team that these precursor components be known to designers and engineers as less stable than the canonical components that have been officially blessed. The design of precursor components is expected to change more frequently than canonical components, so in order to support them in react-spectrum, we would need to do more frequent major version releases for these components. We currently do not have a way to do this since all components are versioned the same way.

### Spectrum CSS upgrades

It is currently quite difficult to do releases of react-spectrum components when changes have occurred in spectrum-css. Often we would like to release a change to a specific component, but in order to do so we need to perform an upgrade to spectrum-css across all components that have been modified in the mean time. This involves manually testing every component that changed to ensure no breakage occurred, and sometimes involves code changes to unrelated react-spectrum components as well.

## Detailed Design

One solution to the above problems is to individually version and release each component in react-spectrum. Each component would have a separate npm package, published under a scope e.g. `@react-spectrum/button`. However, in order to prevent applications from needing to install all of these individual dependencies, a single monolith package would continue to be published. Rather than including all of the code directly as it does currently, it would simply depend on and re-export the individual packages (e.g. `react-spectrum/Button` → `@react-spectrum/button`). Most users would depend on this monolith package, as it would guarantee that all components would have compatible versions, along with some degree of stability in terms of both design and implementation. New major versions of the `react-spectrum` package would be released on a regular cadence (e.g. every 6 months), and would simply upgrade all components to the latest major version.

This would allow breaking changes to occur in individual components without affecting other components. Applications that wish to take advantage of those changes immediately could upgrade individual components whenever they wish, without breaking other parts of their application. Other applications not needing the breaking changes right away would not be forced to upgrade. Depending on individual component packages would typically be short lived, until the next major version of the monolith `react-spectrum` package is released. It will be on users of these individual packages to ensure that they do not have multiple versions of components in their applications, which may cause bugs.

In addition, betas of individual components would be able to be released separately without affecting the monolith package. New precursors could be kept as separate packages that applications would need to explicitly depend on rather than part of the stable `react-spectrum` package. This would make it explicit to applications that those precursor components are less stable but that they can be used at their own risk. Once the components become canonical, they would be included in the main `react-spectrum` package.

This would also make spectrum-css upgrades easier. Since components are released separately, they would each have an independent dependency on `spectrum-css`. When we need to release a particular change to a component, we could upgrade spectrum-css for only that component without affecting other components. This does introduce the possibility of multiple spectrum-css versions with different dependencies, so we would need to be careful about that still.

### Monorepo

Each of these packages would be maintained in a monorepo using [Lerna](http://lernajs.io). This has been successfully used by many open source projects such as Babel, Parcel, and others. The folder structure would look like the following. The files in the `react-spectrum` monolith package would just be there to re-export the underlying individual package. For example, `Button.js`  would contain `export * from` `'``@react-spectrum/button`.

    packages
    ├── button
    │   ├── package.json
    │   ├── src
    │   │   └── Button.js
    │   ├── test
    │   │   └── Button.test.js
    │   └── docs
    │       └── Button.mdx
    ├── combo-box
    │   ├── package.json
    │   ├── src
    │   │   └── ComboBox.js
    │   ├── test
    │   │   └── ComboBox.test.js
    │   └── docs
    │       └── ComboBox.mdx
    ├── ...
    └── react-spectrum
        ├── Button.js
        ├── ComboBox.js
        ├── ...
        └── package.json

## Documentation

This is a major change to the way react-spectrum components are developed and released. We will need to document this versioning strategy for both consumers and contributors. Specifically, we will need a guide on the react-spectrum website describing how to use a beta, precursor, or breaking version of an individual component alongside the default `react-spectrum` monolith package. This should also include information on how to check for and avoid duplicate multiple versions of components in your application. In addition, we will also need documentation on how to contribute to `react-spectrum` related to this monorepo package structure and the individual component versioning.

## Drawbacks

This adds significant additional complexity for maintainers and contributors to react-spectrum. They will need to understand how the individual versioning strategy works, and for new components, how to set up a new package in the monorepo.

In addition, this change adds the possibility of conflicting versions of components in applications, which might cause bugs for users, specifically related to multiple versions of CSS. This might cause additional support cost for the maintainers of react-spectrum to answer questions. Good documentation on how to avoid these types of problems is paramount.

## Backwards Compatibility Analysis

Despite its size, this is a backward compatible change. The monolith `react-spectrum` package will still continue to be published as it was before, and users consuming it should notice no difference other than a few more indirect dependencies.

## Alternatives

Several other design systems such as Atlassian’s Atlaskit follow a similar versioning strategy for individual components. However, they do not also offer a monolithic package in addition to these individual packages, so it is harder for applications to manage all of these dependencies themselves.

## Related Discussions

There have been some related discussions about individually versioning Spectrum design assets for each component, along with individually versioning Spectrum CSS. While those would be welcome changes, they are not required in order to implement this RFC in react-spectrum.
