<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2025-08-27
- RFC PR: (leave this empty, to be filled in later)
- Authors: Devon Govett

# Improving React Aria and React Spectrum dependency management

## Summary

In this RFC, we propose simplifying the way React Aria and React Spectrum are packaged, versioned, and released. This will consolidate all code into a few monolithic packages rather than individually versioned components, reducing dependency management issues during upgrades. It will also provide sub-path exports for each component to reduce bundle size when using tools that don't support tree shaking.

## Motivation

Several years ago, in our [v3 versioning RFC](2019-v3-versioning.md), we decided to release each component as an individually versioned package. The idea was to enable upgrading components separately, release pre-release versions, and allow breaking changes on individual components without affecting others (however we have never exercised this ability).

Since then, we have seen users struggle to manage our dependencies in their applications. When performing upgrades, package managers often try to keep existing versions in the lockfile, which often results in duplicate packages being installed (e.g. [#2195](https://github.com/adobe/react-spectrum/discussions/2195), [#7675](https://github.com/adobe/react-spectrum/discussions/7675)). Due to our use of caret semver ranges to avoid some of this duplication, it is impossible to pin or downgrade to a specific version of our mono-packages without using resolutions ([#6326](https://github.com/adobe/react-spectrum/issues/6326), [#8777](https://github.com/adobe/react-spectrum/issues/8777)). This causes issues for packages that expect to be singletons, especially those with React Context and global event handlers. Caret ranges also make it difficult for us to make breaking changes to internal private utilities, or `UNSTABLE` pre-releases (e.g. [#8635](https://github.com/adobe/react-spectrum/issues/8635)). Duplication also results in larger application bundle sizes.

Because of these issues, we decided to release React Aria Components as a single monolithic package rather than individually versioned components. We prefix pre-release components with `UNSTABLE` instead of using semver. We followed this same approach for Spectrum 2. However, these packages still depend on our `react-aria` and `react-stately` mono-packages, which in turn depend on individually versioned hook packages. Installing `react-aria-components` currently adds over 100 transitive dependencies.

As part of our monolith packages for React Aria Components and Spectrum 2, we rely on bundler tree shaking to produce optimal builds. We use named imports from a single package entry point, which re-exports files for each component:

```tsx
import {Button} from 'react-aria-components';
```

Bundlers have varying levels of tree shaking support. Some bundlers and testing environments don't tree shake in development ([#6737](https://github.com/adobe/react-spectrum/discussions/6734#discussioncomment-11280511)), resulting in long build times. Micro-frontend environments that load components at runtime often don't have tree shaking at all ([#8707](https://github.com/adobe/react-spectrum/issues/8707)), resulting in all components being downloaded when only a single one is used.

In summary, this RFC aims to significantly improve or eliminate these problems:

* Duplicate dependencies being installed
* Breaking changes in private/internal/unstable APIs due to mis-matching versions
* Large bundle sizes and slow build times due to lack tree shaking in various build tools and micro-frontends
* Complicated release process

## Detailed Design

### Mono-package changes

Currently, React Aria and React Spectrum are distributed as over 200 individually versioned npm packages. The `react-aria`, `react-stately`, and `@adobe/react-spectrum` mono-packages re-export these for easier consumption. In this RFC, we propose inverting this model so that all of the code is published within each mono-package, instead of re-exporting from other packages.

```tsx
// Current react-aria mono-package
export {useButton} from '@react-aria/button';
export {useCheckbox} from '@react-aria/checkbox';
export {useRadioGroup, useRadio} from '@react-aria/radio';
// ...
```

```tsx
// Proposed react-aria mono-package
export {useButton} from './button';
export {useCheckbox} from './checkbox';
export {useRadioGroup, useRadio} from './radio';
// ...
```

Additional exports will need to be added to the mono-packages to ensure they include everything exposed by the individual packages today.

### Sub-path exports

To address tree shaking and micro-frontend issues, we will provide sub-path exports for each component:

```json
{
  "name": "react-aria",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./*" {
      "import": "./dist/*/index.mjs",
      "require": "./dist/*/index.cjs"
    }
  }
}
```

This enables importing with a similar syntax to the individual packages. It should be possible to migrate from individual packages to the mono-package by removing the leading `@`:

```diff
- import {useButton} from '@react-aria/button';
+ import {useButton} from 'react-aria/button';
```

For backward compatibility, the existing individual packages will re-export from the mono-package instead of the other way around:

```tsx
// @react-aria/button package
export {useButton} from 'react-aria/button';
```

Package sub-path exports will also be added to `react-aria-components` and `@react-spectrum/s2`, so that individual components can be imported without relying on tree shaking.

```tsx
import {Button} from 'react-aria-components/Button';
import {Checkbox} from '@react-spectrum/s2/Button';
```

Components within `react-aria-components` and `@react-spectrum/s2` will also be updated to use the sub-path imports as well. This will allow importing only the dependencies needed for that component without tree shaking.

```diff
// S2 Button source code
- import {Button} from 'react-aria-components';
+ import {Button} from 'react-aria-components/Button';
```

We may need to provide compatibility with tools that don't support the `package.json` exports field. This can be done using a post-build script that creates top-level folders in the published npm package, instead of nesting them inside the `dist` directory.

### Types

The `@react-types` scope includes both common TypeScript types used across components and some component-specific types. These should be merged into the relevant mono-package at the lowest level layer that uses them.

For example, `RadioGroupProps` will be moved into `react-stately` since it is used by `useRadioGroupState`, `AriaRadioGroupProps` will be moved into `react-aria`, and `SpectrumRadioGroupProps` will be moved into `@adobe/react-spectrum`.

Common types such as those in `@react-types/shared` will also move into the relevant layer. For example, DOM props in `react-aria`, and selection props in `react-stately`. Public types that are only available via `@react-types` currently should be added to the other corresponding mono-packages.

For backward compatibility, the packages in the `@react-types` scope should be updated to re-export from wherever the types moved to. Otherwise, the scope will no longer be used.

### Version pinning

The above changes mean that a significantly smaller number of dependencies will be installed when using `react-aria-components` and `@react-spectrum/s2`. These will be the remaining packages:

* `react-stately`
* `react-aria`
* `@internationalized/*`
* `react-aria-components`
* `@adobe/react-spectrum`
* `@react-spectrum/s2`

Inter-dependencies between these packages should have pinned versions. Duplication could still occur if different parts of an application depend on different versions, but the likelihood is significantly reduced. It will also be much easier to resolve when it occurs because there are fewer packages to coordinate.

The remaining duplication could potentially be solved by creating a single mega-package containing all of these, but this would be quite large and break the separation of concerns.

Individual packages should continue to use caret ranges on the mono-packages for backward compatibility. This will avoid duplication when individual packages and mono-packages are used together, at the cost of the existing issues. These can be resolved by migrating to using the mono-packages directly.

### Code organization

When moving code from individual packages into the mono-packages, we could use the following file structure. This creates a sub-folder under `src`, `stories`, and `test` for each existing package, and reflects how the imports work (e.g. `react-aria/button` resolving to the index file in the `button` folder). The docs should be flattened into the `docs` folder rather than nested, which reflects the URL structure of the website.

```
packages
└── react-aria
    ├── package.json
    ├── src
    │   └── button
    │       ├── index.ts
    │       ├── useButton.ts
    │       ├── useToggleButton.ts
    │       └── useToggleButtonGroup.ts
    ├── stories
    │   └── button
    │       └── useButton.stories.tsx
    ├── test
    │   └── button
    │       └── useButton.test.js
    └── docs
        ├── useButton.mdx
        ├── useToggleButton.mdx
        └── useToggleButtonGroup.mdx
```

Unfortunately moving files in git will make it harder to look at the blame/history. If there is an alternative approach that preserves the history, please comment with a suggestion.

### Summary of changes

1. Move code from `@react-aria/*`, `@react-stately/*`, `@react-types/*`, and `@react-spectrum/*` into their corresponding mono-packages
2. Add individual package sub-path exports for each component in each mono-package
3. Update code in `react-aria-components` and `@react-spectrum/s2` to reference sub-path exports in `react-aria` and `react-stately`
4. Update individual packages in `@react-aria/*`, `@react-stately/*`, and `@react-spectrum/*` to re-export from their corresponding mono-packages
5. Update remaining package dependencies to use pinned version ranges

Aside from the `@react-types` changes, most of this should be possible to automate via scripting.

## Documentation

We will announce the changes in our release notes. We will need to update the versioning and getting started documentation to reference the mono-packages, and any other documentation examples still using individual packages. We will also need to document the per-component sub-path exports, and describe when they should be used.

We could also consider releasing a codemod to help migrate from individual packages to the mono-packages.

## Drawbacks

* For consumers of the individual packages, this will result in more code being installed in `node_modules`. Some consumers only use low level utility packages such as `@react-aria/interactions`. After this change, these will re-export from the `react-aria` mono-package which will contain code for all components. However, this will not affect what is actually imported, so it will not change the bundle size.
* It will no longer be possible to use semver for individual pre-release components. We will need to rely on the `UNSTABLE` prefix instead.
* Future breaking changes will affect the entire library instead of individual components.

## Backwards Compatibility Analysis

This change is backwards compatible. Both the mono-packages and individual packages will continue to include the same (or additional) exports. Individual packages will be maintained until the next major version release.

There are two main backward compatibility concerns:

1. Individual packages often contain "private" exports. These are not documented and not intended for public use, but necessary for our own internal use when code spans across multiple packages. However, given that they are exported, there are likely external consumers that use them anyway. How to handle these is an open question. We may have to expose them somehow from the mono-packages (e.g. with a `PRIVATE` prefix) so that we can re-export them from the individual packages for backward compatibility.
2. In less-strict package managers such as npm and older version of Yarn, undeclared dependencies may still be imported. For example, with `react-aria` listed in an application's dependencies, individual packages such as `@react-aria/button` can also be imported without being declared. These dependencies will be removed from the mono-package, which will break projects that rely on them.

We can write a script to compare the exports from each package before and after the changes and verify that the new versions are a superset.

## Alternatives

* We could partially solve the tree shaking issues with React Aria Components by depending on the individual `@react-aria/*` and `@react-stately/*` packages instead of the mono-packages. See https://github.com/adobe/react-spectrum/pull/8704
* We could consider pinning all dependency versions on individual packages instead of using caret ranges to solve breaking change issues, but this has downsides. See https://github.com/adobe/react-spectrum/issues/8777
* We could create build plugins to solve tree shaking issues: https://github.com/adobe/react-spectrum/issues/8707
* We could provide a script or package manager plugins to help perform upgrades or deduplicate versions

Ultimately, these are only partial solutions to the problems described in this RFC.

## Open Questions

* How to handle moving code while preserving git history
* How to handle backward compatibility for private exports in individual packages
* Should we use sub-path imports in our documentation examples, or keep them using the named exports from the index file?

## Frequently Asked Questions

**Will the individual `@react-aria/*` and `@react-stately/*` packages continue to exist?**

Yes. They will remain published and re-export from the corresponding mono-package for backward compatibility. In the long term, they will be deprecated when we release the next major version.

**How will I migrate?**

Existing code will continue to work with the individual packages. To migrate to the mono-packages, users can replace imports like:

```diff
- import {useButton} from '@react-aria/button';
+ import {useButton} from 'react-aria/button';
```

We plan to provide codemods and documentation to make this transition smoother.

**What about private or internal exports?**

Some individual packages expose private APIs that were never intended for public use but are consumed externally. We are considering re-exporting these with a `PRIVATE_` prefix from the mono-packages, and under their original name from the individual packages to avoid breaking those consumers. These APIs will remain undocumented and may change without notice.

**What happens to @react-types?**

These will be folded into the corresponding mono-packages. For now, the @react-types packages will remain and re-export types from their new homes. These packages will be deprecated in the future.

## Related Discussions

* https://github.com/adobe/react-spectrum/discussions/2195
* https://github.com/adobe/react-spectrum/discussions/6734
* https://github.com/adobe/react-spectrum/discussions/7766
* https://github.com/adobe/react-spectrum/issues/8635
* https://github.com/adobe/react-spectrum/issues/8777
* https://github.com/adobe/react-spectrum/issues/8707
* https://github.com/adobe/react-spectrum/issues/7946
* https://github.com/adobe/react-spectrum/issues/6326
* https://github.com/adobe/react-spectrum/discussions/7675
