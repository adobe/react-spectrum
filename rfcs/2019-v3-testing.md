- Start Date: 2019-05-13
- RFC PR: (leave this empty, to be filled in later)
- Authors: Daniel Lu

# React Spectrum V3 Testing Updates

## Summary

<!-- One-paragraph explanation of the feature. -->
 
As of May 2019, the vast majority of the tests in React Spectrum are so called "shallow" tests, tests that by design do not render the component in a DOM and constrain the test writer to testing the component as an isolated unit. However, with the advent of React Spectrum v3, it has become apparent that this level of testing is no longer adequate. In response, updates need to be made to the kinds of tests we write in order to ensure code quality moving forward. These updates include a proposed paradigm shift of majority "shallow" to majority "mount" tests, test frameworks that fit the React Hooks world, and explorations for automated UI testing via headless browsers. 

## Motivation

<!-- Why are we doing this? What use cases does it support? What is the expected
outcome? -->

To understand the impetus behind this testing reform, one must understand the proposed changes occurring with React Spectrum v3. Here is a list that covers a couple of them:

1. [Architecture changes powered by React Hooks](https://github.com/adobe/react-spectrum/blob/master/rfcs/2019-v3-architecture.md)
2. CSS Modules for styling flexibility
3. Minor/major api changes for many of the current components

With change comes bugs, and that's a lot of change. Short of exhaustively manually testing each and every component, we need a way to ensure that the components still work as expected, a responsibility which typically falls upon an automated test suite. 

### Issues with v2 test suite
Luckily for us, many of the changes in v3 don't affect component functionality, so theoretically a functional test suite for React Spectrum v2 could cover v3 with minimal changes. Unfortunately, this is where our current "shallow" test suite falls short. Many of the tests rely heavily on css class name selectors to target specific elements, class names that would become unavailable once they undergo css modularization. Additionally, due to the nature of "shallow" tests, tests would occasionally access the component's props for assertion purposes, interact with a component's internal methods to simulate behavior, or modify state/props directly, all of which would break due to component implementation changes made in v3. 

### Gaps in coverage
Aside from the v2 test suite's incompatibility with the v3 changes, we also need to address some holes in our current testing framework. First, we need to be able to test React Hooks. While Hooks may seem like standard functions, they cannot be tested without being wrapped within functional components. Secondly, very few of our tests render the components in a DOM. Testing without a DOM creates a false sense of security as it does not render a true UI experience. To test effectively we would want tests to run in as close to a production environment as possible. Ideally, this sentiment includes supporting tests runs in a wide array of browser types but whether these test could/would be the same mount style tests written to run against JSDOM is still a point of exploration.    

### End Goal:

We want our test suite to follow the following guidelines so we can be confident in our code quality.
1. Functionality tests should not break if implementation details change.
2. Tests are more effective the more closely they simulate end user experience.
3. React Hooks are a thing, so we need to test them

## Detailed Design

<!--
   This is the bulk of the RFC.

   Explain the design with enough detail that someone familiar with React-Spectrum
   can implement it by reading this document. Please get into specifics
   of your approach, corner cases, and examples of how the change will be
   used. Be sure to define any new terms in this section.
-->
### General summary of changes in consideration

In short:
- Mocha -> [Jest](https://jestjs.io) (nice coupling with new frameworks)
- Enzyme (shallow test) -> [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) (mount style tests)
- [React Hooks Testing Library](https://github.com/mpeyper/react-hooks-testing-library) for hook testing

Tentative:
- [Jest Puppeteer](https://github.com/smooth-code/jest-puppeteer) for running UI tests against headless Chrome
- [Karma](https://github.com/karma-runner/karma)/some solution that supports running tests inside multiple browsers

### What kinds of tests will be written?

Note: The following serves mainly as a guideline. Tests should be constructed to fit testing needs.

The majority of the tests that will be written after this transition will be mount style tests using the React Testing Library. Each test will be scoped at a component level, with exceptions made for integration testing of several components if those components prove to be tightly coupled. Tests should cover general component behavior as seen from an end user's perspective, with all interactions done via simulated events (clicks, keyboard interactions, etc) and not by direct function calls. For the most part, this style of test writing will be enforced by the React Testing Library itself. Shallow style tests can still be written in Enzyme for situations that require it (testing bits of internal component logic or forcing prop/state changes) but should be avoided if at all possible.

The second kind of tests will be those written against the state/behavior hooks described [here](https://github.com/adobe/react-spectrum/blob/master/rfcs/2019-v3-architecture.md#architecture). Since hooks are basically functions, tests will cover the standard input-output test cases. These tests will be written using the React Hooks Testing Library so we won't have to write our own hook wrapping test harnesses.

A tentative third type of test would be UI tests that could run against a real browser. Ideally, we would be able to reuse the mount tests and run them in browser but the viability of this has not been fully explored yet. If this ends up being impossible, 
[Jest Puppeteer](https://github.com/smooth-code/jest-puppeteer) may prove to be a reasonable framework for writing automated tests that run in headless Chrome. UI tests are typically quite expensive to write and maintain, so further discussions regarding their usage will need to be had before committing. 

### Where will tests live?

With the new package based structure proposed in v3, tests should live near the code they test. For example, component tests should be located in `packages/@react-spectrum/COMPONENT/tests` and hooks tests should be located in `@react-stately` or `@react-aria` respectively. See [here](https://github.com/adobe/react-spectrum/blob/master/rfcs/2019-v3-architecture.md#packages-and-file-structure) for a visual diagram.

### When should the tests be written? 

Ideally, tests would be written alongside and submitted with the code it tests. 

### When would the tests run?

The entire test suite would be run in each pull request as a possible blocking check.

### Is there a testing standard?

Since test formulation is a creative process, a standard will need to be established to ensure a degree of test consistency. Some possible standards could be as follows:

- All components should pass a set of baseline tests e.g. components accept custom classnames
  - Comprehensive list of baseline tests to be established, further research required
- Tests should cover core user flows and interactions (possible discussion with product as a requirement)
- Component test ids should be utilized over class names where possible to prevent test brittleness.

### How will this transition happen?

In order to ensure that we retain the same component functionality from v2 to v3, the first step in this testing transition would be to convert all of the v2 tests to use the React Testing Library. As components are transitioned from v2 to v3, we'll run those v2 tests against the new v3 components to ensure functionality hasn't diverged unexpectedly while at the same time validating that writing our tests using the React Testing Library properly safeguards us from testing implementation details. If the test passes, it will serve as the new v3 component test, with additional changes being made to accommodate desired v2->v3 changes. Additional tests will be added afterwards to match test standard.

Once we are comfortable with test stability and fidelity, the pull request build job can be changed to run the v3 test suite. The v2 tests will continue to exist as long as the v2 components are officially supported.

## Documentation

<!--
    How will this RFC be documented? Does it need a formal announcement to explain 
		the motivation?
-->

Since this is a major change that introduces several new testing frameworks, we will need to document our new test writing standards. Sample tests would go a long way in easing this transition for contributors. Additionally, the current README in react-spectrum will need to be updated to reflect changes in how to run the tests, frameworks used, etc.

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

- Time consuming to refactor all the v2 tests
- Introduces new frameworks and test writing styles that current contributors will have to learn 
- Unknown test fidelity (false positives? doesn't catch bugs?)
- Potentially longer test runs that may slow down pull request process

## Backwards Compatibility Analysis

<!--
    How does this change affect existing React-Spectrum users? Will any behavior
    change for them? If so, how are you going to minimize the disruption
    to existing users?
-->

This change should only affect contributors to React Spectrum, since they will be the ones who will have to write the tests. Consumers of React Spectrum shouldn't be affected at all.

## Alternatives

<!--
    What other designs did you consider? Why did you decide against those?

    This section should also include prior art, such as whether similar
    projects have already implemented a similar feature.
-->

When it comes to testing, there are a plethora of alternative frameworks that exist for consideration. Enzyme's "mount" was rejected in favor of the React Testing Library simply because React Testing Library is designed to restrict the user from being able to test implementation details. Enzyme provides the tester with too many ways to interact with a component's internal state/methods, resulting in tests that are over reliant on component implementation. 

For in browser UI testing, Puppeteer edges out the typical Selenium webdriver testing frameworks since it has cleaner integration with Jest and doesn't require us to handle webdriver versioning. Running Enzyme tests in multiple browsers with Karma was investigated in the following [repository](https://git.corp.adobe.com/engage/UE_POC) but proved to be incredibly slow. Disclaimer: I'm not a Webpack expert so it is entirely possible that it was my configuration that made Karma slow.

Jest snapshot testing was also considered, but was deemed to possibly too noisy. Updating snapshots is also done in bulk so it is very easy to accidentally commit a erroneous snapshot.

## Open Questions

<!--
    This section is optional, but is suggested for a first draft.

    What parts of this proposal are you unclear about? What do you
    need to know before you can finalize this RFC?

    List the questions that you'd like reviewers to focus on. When
    you've received the answers and updated the design to reflect them, 
    you can remove this section.
-->

- Alternative ideas about testing in general?
- Prior experience with this testing strategy? How did it work out for you? How useful were these kinds of tests?
- Jest snapshot testing? Use case and effectiveness?

## Related Discussions

<!--
    This section is optional but suggested.

    If there is an issue, pull request, or other URL that provides useful
    context for this proposal, please include those links here.
-->

Sample implementation can be found here: https://github.com/adobe/react-spectrum/compare/v3...test_framework_explore. Feedback is greatly appreciated.
