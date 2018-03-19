# Contributing to react-spectrum

So, you want to contribute? 🎉🎉🎉

## Who can Contribute?

Anyone! In fact, we welcome contributions. And while only some have merge rights, the more you contribute more fun you will have.

## What should I know before I get started?

All work should happen within [Github](https://git.corp.adobe.com/react/react-spectrum), in the [wiki](https://wiki.corp.adobe.com/display/RSP), or in the [issue tracker](https://jira.corp.adobe.com/projects/RSP).

That is to say: all pull requests should have a issue associated in JIRA. The wiki is a great place for design documents.

Bugs, feature requests, tasks, etc should be reported within the [issue tracker](https://jira.corp.adobe.com/projects/RSP).

HOWEVER: if you have a question, use the resources below to talk to real humans.

## Where is everyone?

Most contributors chat in the #react-spectrum Slack channel. Questions, initial proposals, and some idle chatter happens there on most days.

Other useful links:
 - [Teams using react-spectrum](https://wiki.corp.adobe.com/display/RSP/Teams+using+react+spectrum)
 - Email group: react-spectrum@adobe.com -- subscribe to grp-react-spectrum
 - [Monthly meetups](https://wiki.corp.adobe.com/display/RSP/Community+Meetups)

## Branching

The [master](https://git.corp.adobe.com/react/react-spectrum/tree/master) branch is the mainline branch. All pull requests should be issued against it.

When using the code in production however, do note that the master branch may have features that are not certified by QA yet. Be sure to check out the [releases](https://git.corp.adobe.com/React/react-spectrum/releases) page for the current stable builds.

## Semantic Versioning

react-spectrum follows semantic versioning. Breaking changes (which should not happen often) are accompanied by a major version bump. Bug fixes / patches, new components will be released by patch and minor versions, respectively.

Releases (generally) happen every two weeks and will include whatever is merged and certified from the master branch.

## Making a Pull Request

We welcome pull requests! Ensure that you have either created an issue in [JIRA](https://jira.corp.adobe.com/projects/RSP) or have grabbed one from the backlog.

### Step-by-step (day by day)

0. Ensure Git, Node, and NPM are installed.
1. Fork the repository.
2. Clone your fork.
3. `cd` into your fork and run `npm install`.
4. Ensure your work has an associated story, bug, or task in [JIRA](https://jira.corp.adobe.com/projects/RSP).
5. Choose a descriptive branch name.
6. Write your code.
7. Write unit tests and run them with `npm test`. They should pass.
8. Ensure the linter loves your code with `npm run lint`.
9. Commit your code.
10. Push your branch.
11. Open a pull request against react-spectrum's master branch.
