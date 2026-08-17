# Testing

Test suites are split by type:

- **Jest tests** — `yarn test`
- **SSR tests** — `yarn test:ssr`
- **Browser tests** — `yarn test:browser`
- **Visual regression tests (VRT)** — `yarn chromatic`
- **High-contrast-mode VRT** — `yarn chromatic:forced-colors`

Maintainers run the Chromatic VRT suites themselves — don't run `yarn chromatic` / `yarn chromatic:forced-colors`. You can still start the VRT Storybooks locally to verify visual state: `yarn start:chromatic` and `yarn start:chromatic-fc`.

Tests are **not** co-located with source — each package keeps them in a sibling `test/` directory. The file suffix routes the test to a runner: `*.ssr.test.*` → `yarn test:ssr`, `*.browser.test.*` → `yarn test:browser`, plain `*.test.*` → `yarn test` (Jest). Shared test helpers live in `@react-aria/test-utils` / `@react-spectrum/test-utils` (the `User` event abstraction and per-component testers).

## Writing tests

- **Run the full suite before committing.** Do not write PR descriptions that list a subset of specific passing tests — run `yarn test`, `yarn test:ssr` and (when relevant) `yarn test:browser` — do not run the Chromatic VRT suites (see above).
- **Run lint and formatting before committing** (`yarn lint`, `yarn format`).
- **Test at the right level.** For any change at the RAC level or below (including hooks), write the test at the RAC level ideally. If the change lives at a higher level, test at that level.
- **Move to browser tests when needed.** If a test requires mocking specific browser behavior, consider moving it to the browser run (`yarn test:browser`).
- **Cover the reported issue.** When fixing a reported issue, add a test that reproduces the specific example given in the issue.
- **Check whether the test already exists.** Find a home for it near other similar tests.
- **Check code coverage** to help decide whether a new test adds value — this is subjective.
- **In unit tests, prefer** fake timers, our test utils, and user event. Aside from those, prefer not mocking other modules, instead, move the test to a higher level.
- **Combine tests** that share the same setup before an assertion.
- **Ground test titles in the goal**, not the implementation — double-check they are accurate.
