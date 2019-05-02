# Contributing to react-spectrum

So, you want to contribute? 🎉🎉🎉

## Who can Contribute?

Anyone! In fact, we welcome contributions. And while only some have merge rights, the more you contribute more fun you will have.

## What should I know before I get started?
Check you have access to [react-spectrum in github] (https://github.com/adobe/react-spectrum) in the Adobe org. If not, you can follow the instructions on the [Adobe Open Source Advisory Board website](https://git.corp.adobe.com/OpenSourceAdvisoryBoard/handbook/blob/master/GitHub-Adobe-Org-Management.md#request-access-to-our-adobe-github-org).

All work should happen within [Github](https://github.com/adobe/react-spectrum), or in the [issue tracker](https://github.com/adobe/react-spectrum/issues).

That is to say: all pull requests should have a issue associated in github issues. Our [rfc folder](https://github.com/adobe/react-spectrum/tree/master/rfcs) is also a great place for discussing and proposing larger changes and features.

Bugs, feature requests, tasks, etc should be reported within the [issue tracker](https://github.com/adobe/react-spectrum/issues).

HOWEVER: if you have a question, use the resources below to talk to real humans.

## Where is everyone?

Most contributors chat in the #react-spectrum Slack channel. Questions, initial proposals, and some idle chatter happens there on most days.

Other useful links:
 - [Teams using react-spectrum](https://wiki.corp.adobe.com/display/RSP/Teams+using+react+spectrum)
 - Email group: react-spectrum@adobe.com -- subscribe to grp-react-spectrum
 - [Monthly meetups](https://wiki.corp.adobe.com/display/RSP/Community+Meetups)

## Branching

The [master](https://github.com/adobe/react-spectrum/tree/master) branch is the mainline branch. All pull requests should be issued against it.

When using the code in production however, do note that the master branch may have features that are not certified by QA yet. Be sure to check out the [releases](https://github.com/adobe/react-spectrum/releases) page for the current stable builds.

## Semantic Versioning

react-spectrum follows semantic versioning. Breaking changes (which should not happen often) are accompanied by a major version bump. Bug fixes / patches, new components will be released by patch and minor versions, respectively.

Releases (generally) happen every two weeks and will include whatever is merged and certified from the master branch.

## Making a Pull Request

We welcome pull requests! Ensure that you have either created an issue in [github issues](https://github.com/adobe/react-spectrum/issues) or have grabbed one from the backlog.

### Step-by-step (day by day)

0. Ensure Git, Node, and NPM are installed.
1. Fork the repository.
2. Clone your fork.
3. `cd` into your fork and run `yarn install`.
4. Ensure your work has an associated issue in [github issues](https://github.com/adobe/react-spectrum/issues).
5. Choose a descriptive branch name.
6. Write your code.
7. Write unit tests and run them with `npm test`. They should pass.
8. Commit your code.
9. Push your branch.
10. Open a pull request against react-spectrum's master branch.

### Accessibility

Adobe products must support accessibility requirements and comply with regulatory requirements which enable people with disabilities to access Adobe's applications, services, and content created by Adobe tools. As such, React-Spectrum components have to support accessibility out of the box and in a way that makes it easy for application developers to use them while supporting accessibility. These requirements come from the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG21/) are summarized in the [Adobe Accessibility Standard](https://wiki.corp.adobe.com/display/Accessibility/Adobe+Accessibility+Standard); the most relevant to React-spectrum include:
 * **[Keyboard requirements](https://wiki.corp.adobe.com/display/Accessibility/Adobe+Accessibility+Standard#AdobeAccessibilityStandard-KeyboardRequirements)**
 * **[Assistive Technology Requirements](https://wiki.corp.adobe.com/display/Accessibility/Adobe+Accessibility+Standard#AdobeAccessibilityStandard-AssistiveTechnologyRequirements)**
 * **[Low Vision Requirements](https://wiki.corp.adobe.com/display/Accessibility/Adobe+Accessibility+Standard#AdobeAccessibilityStandard-LowVisionRequirements)**
 * **[Color Requirements](https://wiki.corp.adobe.com/display/Accessibility/Adobe+Accessibility+Standard#AdobeAccessibilityStandard-ColorRequirements)**

#### Getting Started with Accessibility
1. When beginning work on a new component, be sure to include contributors from the accessibility team, Michael Jordan ([mijordan@adobe.com](mailto:mijordan@adobe.com)) and James Nurthen ([nurthen@adobe.com](mailto:nurthen@adobe.com)) in your kickoff meeting. They can help clarify accessibility design patterns and requirements.
2. Figure out the appropriate accessibility design pattern for your component.
 * For a simple control, like a text input, you may not need to do much more than follow the [appropriate guidance for labeling an input](https://www.w3.org/TR/html50/forms.html#the-label-element) in HTML and test to ensure the rendered component is labeled appropriately.
 * For more complicated custom or composite controls, like for example a TreeView or Data Grid, [Accessible Rich Internet Applications (WAI-ARIA) 1.1](https://www.w3.org/TR/wai-aria-1.1/) can be used to communicate a component's label, role, state and property information, as well as the role, state and property information of descendent elements, to assistive technology via the accessibility API. To get started with WAI-ARIA:
    1. First, check [WAI-ARIA Authoring Practices 1.1](https://www.w3.org/TR/wai-aria-practices-1.1/) to see if an appropriate design pattern exists for the type of component you are developing. Each design patterns provides guidance on the appropriate keyboard interaction behavior for the component and instructions on the appropriate attributes to add to communicate the component and its descendants' label, role, state and property information to assistive technology.
    2. Next, if the design pattern you're looking for isn't in the [Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/) guide, check the [WAI-ARIA 1.1](https://www.w3.org/TR/wai-aria-1.1/) specification for the appropriate role under [5.3.2 Widget Roles](https://www.w3.org/TR/wai-aria-1.1/#widget_roles). Each role description, and particularly those for composite controls, provides some implementation guidance. For example: [combobox](https://www.w3.org/TR/wai-aria-1.1/#combobox).
    3. If you are unsure of what design pattern the component should use, don't hesitate to ping the accessibility team, [mijordan@adobe.com](mailto:mijordan@adobe.com) and [nurthen@adobe.com](mailto:nurthen@adobe.com), directly.
3. A few questions to ask as you develop your component to support accessibility:
  * How does a developer add a label to this control?
  * If the component can be labeled using FieldLabel, does clicking the FieldLabel set focus to the component?
  * When you add a mouse event handler, like click or mousedown, ask how will a user perform this action using the keyboard?
  * If a task causes the element with focus to go away, to where should the keyboard focus be restored?
  * Is the current state of the control properly communicated when using a screen reader?
  * When the user changes the value of a control is the value change communicated to the user when using a screen reader?
