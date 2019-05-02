# Frequently Asked Questions

## Process

1. **Where do I ask questions or get support?**

    Join the #react-spectrum room in Slack (any workspace).

1. **Where do I file bugs?**

    You can file issues or improvement tickets in our [GitHub](https://github.com/adobe/react-spectrum/issues).
    There is also a [JIRA board](https://jira.corp.adobe.com/secure/RapidBoard.jspa?rapidView=21015)
    where you can see the current Sprint and prioritized backlog for the core team.

1. **How do I ensure feedback on issues**

    - Is the issue reproducible in Storybook?
      - This is by far the fastest approach
    - Is there something in your project potentially interacting in an unexpected way? Here are some tips for answering this question:
      - If I remove everything on my page except the component in question, does it still have a problem?
      - Is there some application CSS overriding the component's CSS?
      - Is there some application javascript hooked up to the component's CSS classes?
      - Do I have multiple copies of React Spectrum in my project/page?
        `npm ls @react/react-spectrum` is there more than one?
        Does the component work correctly if you take a different path through the application to get to it? (or a different url route)
    - Can I fix it in React Spectrum so that it works in my project? Once done, am I now capable of reproducing with a new story in Storybook?
    - If the above truly cannot be done, are there very detailed instructions to reproduce in your product with user credentials? + video steps? + expectations? + promise of cookies/ice cream?

1. **What are some responses you should try to avoid with appropriate information**
    - Component is working as intended, please consult [spectrum guidelines](https://spectrum.corp.adobe.com/) and/or [W3 accessibility documentation](https://www.w3.org/standards/webdesign/accessibility)
    - There is a different component that is better suited to your needs, please refer your designer to Spectrum guidelines
    - Are you using the `<Provider>` component

1. **Who is working on react-spectrum?**

    Many teams across adobe are contributing, and we encourage anyone to make pull requests.
    We also have a core team which maintains the project, reviews code, etc. The current core team includes:

    * Danielle Robinson, engineering/project lead
    * Devon Govett, engineering/project lead
    * Vijay Jain, engineer, part-time
    * Rob Snow, engineer
    * Kyle Taborski, engineer
    * Daniel Lu, engineer

1. **Who is using react-spectrum?**

    See this page on the [wiki](https://wiki.corp.adobe.com/display/RSP/Teams+using+react+spectrum).

1. **Where can I find documentation about react-spectrum?**

    Full documentation is a work in progress, but the best place to look is the
    [docs](http://react-spectrum.corp.adobe.com/) and the [storybook](https://react-spectrum.corp.adobe.com/storybook/).
    The storybook lists each state of every component, and shows the JSX code used to create the example alongside the output.
    You can also check the [source](https://github.com/adobe/react-spectrum/tree/master/stories) for the storybook examples
    to see more detailed code samples.

1. **Is X feature planned/in development? What is the ETA for X?**

    Please check the [GitHub issues](https://github.com/adobe/react-spectrum/issues) to see if
    there is an open issue for your feature. If there is, and it is not already being worked on, you can assign yourself
    or a team member to work on it. Please reach out to the #react-spectrum slack room to discuss an implementation plan
    prior to implementing, and to notify others that you will be working on it. If you are unable, or unwilling to work on
    the feature yourself, or someone else is already assigned, you can also reach out to the #react-spectrum slack room
    to notify us of your priority and we will try to include it in an upcoming sprint. The fastest way to get things done
    is always to do it yourself, but we can try to help out where we can as well.

    If there is no ticket in GitHub issues, you can create one. Please reach out to the #react-spectrum slack room about your ticket
    as well, so we can discuss it and provide feedback. This is probably best done prior to writing up the issue.

1. **What is the release process for react-spectrum?**

    We release a new version every 2 weeks at the end of our sprints. As new features and fixes are merged into master,
    they are released immediately as beta versions. After QE signs off on the features, they are put into a release.
    Releases can be found in the Github project, for example: https://github.com/adobe/react-spectrum/releases/tag/v2.4.0.

1. **When is the next react-spectrum release?**

    You can check the [JIRA board](https://jira.corp.adobe.com/secure/RapidBoard.jspa?rapidView=21015) to see the current sprint.
    The next release will be at the end of the sprint.

1. **How do I contribute to react-spectrum?**

    See [CONTRIBUTING](CONTRIBUTING.md). Generally, you should fork the project, and make a pull request. Pull requests are more than welcome.
    This is a community driven project and the stronger the community, the stronger the library.

1. **How do I join the react-spectrum core team and what does that entail?**

    If you have time available, we would love to add more members of the core team. Please reach out to Danielle Robinson or Devon Govett,
    and we would be happy to add you to our sprint plannings etc. We especially need help with documentation, but will take any help we can get.

## Technical

1. **How do I override the styling of a component?**

    It is generally not a good idea to override the styling of spectrum components, though it is acceptable in some cases.
    For example, overriding spectrum colors, typography, etc. is not allowed. But sometimes you need to override dimensions, or margins
    of some components, for example. For this, you should apply a custom class to the component and target it in your CSS.
    You should not target the `.spectrum` prefixed selectors, as they are implementation details that may change at any time.

    Here is an example of overriding the margin on a button:

    ```javascript
    <Button className="my-button" label="My Button" />
    ```

    ```css
    .my-button {
      margin-left: 200px;
    }
    ```

2. **My product design mock differs from what is in react-spectrum. What should I do about it?**

    It is our goal to help unify designs across Adobe products, and to do this we need the help of both designers and engineers.
    If you see a component in your design mocks which looks slightly different from a spectrum component, e.g. a button
    with a different color, or additional padding, you should find the most similar existing spectrum component and
    use that (and notify your designer as well). In some cases, these slight variations may be necessary. At those times,
    you should bring up the design with the Spectrum design team in the #requests room of the Spectrum slack workspace.

3. **Why am I seeing React warnings in the browser console?**

    As React has evolved over the years, it has added more warnings to help developers improve their code. Since react-spectrum
    was originally written against older versions of React, we haven't had time to fix all of the warnings yet. The warnings can
    generally be ignored, but if you are feeling up to it, a pull request to fix a warning here and there would be much appreciated!

4. **How do I access the DOM event object from an event handler?**

    react-spectrum has followed the pattern of value first, event second. For example, `onChange(value, event)`. This differs from the standard
    DOM API which only passes an event object, but is generally more useful. It is more common to just want the new value rather than the event,
    and this pattern is more consistent for handlers which don't have a DOM event object available as well.

5. **Why is the Wait/Progress component's filesize so large?**

    The Wait and Progress components use a large SVG animation in spectrum-css currently. This is in process of being replaced, and should be fixed soon.

6. **What is collection-view and why does react-spectrum use it?**

    [collection-view](https://git.corp.adobe.com/React/collection-view) is a library used by several react-spectrum components:
    ColumnView, TableView, and TreeView so far. It handles several common aspects of displaying large lists of items, such as
    virtual scrolling and recycling of views (only displaying visible views in the DOM), multi-selection, drag and drop, keyboard
    navigation, and more. It does all of this in a standard way so we don't need to re-implement all of this behavior in many different
    components. It lives as a separate library for historical reasons, and also because it's useful outside react-spectrum.

7. **What browsers does react-spectrum support?**

    Edge, evergreen Chrome, Firefox, and Safari.

8. **Where do I find a list of icons that are available in react-spectrum?**

    http://spectrum-css.corp.adobe.com/icons/

9. **Is react-spectrum accessible?**

    It is our goal to have react-spectrum be completely accessible, but that is currently a work in progress. If you find an accessibility bug,
    please check GitHub issues to be sure we aren't already aware of it, and if not please file a ticket.

10. **I get an error `Uncaught ReferenceError: regeneratorRuntime is not defined` on instantiating some components like `Dialog`. How do I resolve it?**

    Installing `babel-polyfill` should solve it for you. It's needed to get async/await working. Refer [this link](https://stackoverflow.com/a/33527883/4741998) for more details.

    If you want to avoid all of the additional bundle size incurred by including all of `babel-polyfill`, you might want to use `babel-plugin-transform-runtime`.

    **Disclaimer**: If you don't install all of `babel-polyfill`, there will not be browser support for all browsers (including IE) especially those that don't natively support methods (e.g `Map`, `Set`, etc.), but which we depend on in `react-spectrum`. You might need to add those polyfills as well for all of your supported browsers.

    The solution is to import `regenerator-runtime` directly at the top of the entry/entries point(s) of you application. https://www.npmjs.com/package/regenerator-runtime.

    With `regenerator-runtime@0.13.x`, the global `regeneratorRuntime` variable is no longer automatically created (unless you evaluate the runtime code in global scope, rather than a Webpack wrapper), but you can import the runtime and define the variable globally yourself. An other solution is to downgrade to `0.12`. Refer [this link](https://github.com/facebook/regenerator/issues/363) for more details.

    > Note that if you use [Babel 7](https://babeljs.io/docs/en/config-files#6x-vs-7x-babelrc-loading) you can do that in an elegant way and include polyfill only as needed: https://www.thebasement.be/working-with-babel-7-and-webpack/#a-cleaner-approach
