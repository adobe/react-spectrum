# Contribute

Thanks for choosing to contribute! We look forward to improving web applications together. Here you will find information on how to propose bug fixes, suggest improvements, and develop locally.

## Better together
We believe that the best way to build a better web is together as a community. The React Spectrum project aims to make it easier to build design systems and component libraries with high quality interactions and accessibility for all. The core team and all external contributors follow the same process in order maintain a high quality codebase.

## Code of conduct
We adhere to the Adobe [code of conduct](https://github.com/adobe/react-spectrum/blob/main/CODE_OF_CONDUCT.md) and by participating, you are expected to uphold this code. Please report unacceptable behavior to Grp-opensourceoffice@adobe.com.

## Reporting issues
### Bugs
We use [GitHub issues](https://github.com/adobe/react-spectrum/issues) to track work and log bugs. Please check existing issues before filing anything new. We do our best to respond to issues within a few days. If you would like to contribute a fix, please let us know by leaving a comment on the issue.

The best way to reduce back and forth on a bug is provide a small code example exhibiting the issue along with steps to reproduce it. If you would like to work on a bugfix yourself, make sure an issue exists first.

Please follow the issue templates when filing new ones and add as much information as possible.

### Feature requests
Our components can always be improved upon. If you have a feature request, you can use our Feature Request issue template. For larger scopes of work, it is a good idea to open a Request For Comments (RFC) first to gather feedback from the team. Please follow our RFC [template](https://github.com/adobe/react-spectrum/blob/main/rfcs/template.md). Make a PR to add your RFC to the [rfcs folder](https://github.com/adobe/react-spectrum/tree/main/rfcs) to give the team and the community a chance to discuss the proposal.

### Security issues
Security issues shouldn't be reported on this issue tracker. Instead, please follow the directions [here](https://helpx.adobe.com/security/alertus.html) to contact our security team.

## Pull Requests
For significant changes, it is recommended that you first propose your solution in [an RFC](#feature-requests) and gather feedback.

A few things to keep in mind before submitting a pull request:

- Add a clear description covering your changes
- Reference the issue in the description
- Make sure linting and tests pass
- Include relevant unit tests
- Add/update stories in storybook for your changes
- Update documentation
- Remember that all submissions require review, please be patient.

The team will review all pull requests and do one of the following:
- request changes to it (most common)
- merge it
- close it with an explanation.

Read [GitHub's pull request documentation](https://help.github.com/articles/about-pull-requests/) for more information on sending pull requests.

Lastly, please follow the pull request template when submitting a pull request!

### Contributor License Agreement
All third-party contributions to this project must be accompanied by a signed contributor license agreement. This gives Adobe permission to redistribute your contributions as part of the project. [Sign our CLA](https://opensource.adobe.com/cla.html). You only need to submit an Adobe CLA one time, so if you have submitted one previously, you are good to go!

## Where to start
There are many places to dive into react-spectrum to help out. Before you take on a feature or issue, make sure you become familiar with [our architecture](https://react-spectrum.adobe.com/architecture.html).

If you are looking for place to start, consider the following options:
- Look for issues tagged with help wanted and/or good first issue.
- Help triage existing issues by investigating problems and following up on missing information.
- Update missing or fix existing documentation
- Review and test open pull requests

## Developing
When you are ready to start developing you can clone the repo and start storybook.
Make sure you have the following requirements installed: [node](https://nodejs.org/) (v14.15.0+) and [yarn](https://yarnpkg.com/en/) (v1.22.0+)

Fork the repo first using [this guide](https://help.github.com/articles/fork-a-repo), then clone it locally.
```
git clone https://github.com/YOUR-USERNAME/react-spectrum
cd react-spectrum
yarn install
```

You can then run the storybook and browse to [http://localhost:9003](http://localhost:9003) with:
```bash
yarn start
```

Or run the documentation and browse to [http://localhost:1234/](http://localhost:1234/) with:
```bash
yarn start:docs
```

### Component/Hook scaffolding
If you are looking to contribute a brand new component or Hook in a package that does not exist yet, please run the following command.
```bash
yarn plop
```
This will start a series of cli prompts to determine what template files and folders should be generated to help quick start your contribution.
The prompts are as follows:

1. What type of project are you setting up?
    - Select "React Spectrum v3"

2. Scope name(s)
    - Select the package scopes that make sense for your contribution (e.g. react-spectrum if you are contributing a component, react-aria for an aria Hook, etc)

3. Package name, all lowercase (e.g. textfield)

4. Component name, please use appropriate uppercase (e.g. TextField)
    - If you are contributing a non-component Hook, just enter the name of your Hook.

5. Component css module name, blank if N/A. If unsure, check @adobe/spectrum-css-temp/components for a module containing the desired css (e.g. textfield)
    - If you cannot find the component CSS module name in @adobe/spectrum-css-temp/components, feel free to reach out to a team member via GitHub Issues or Discussions.

Upon answering all the prompts, the appropriate package(s) should be generated and ready for modification.

**Note:** With regards to the generated docs files, please feel free to remove them if you won't be contributing docs. If you are contributing docs for a new component or Hook, please submit them in a separate pull request so that we can decide when to deploy them to our docs site.

### Tests
We use [jest](https://jestjs.io/) for unit tests and [react-testing-library](https://testing-library.com/docs/react-testing-library/intro) for rendering and writing assertions. Please make sure you include tests with your pull requests. Our CI will run the tests on PRs as well as the linter and type checker. You can see on each PR whether you have passed all our checks. We split the tests into 2 groups.

*Visual tests*
- A Storybook story should be written for each visual state that a component can be in (based on props).

*Unit tests*
- (Props) Anything that should be changed by a prop should be tested via react-testing-library.
- (Events) Anything that should trigger an event should be tested via react-testing-library.

You can run the tests with:

```bash
yarn jest
```

You can also get a code coverage report by running:

```bash
yarn jest --coverage
```

### Linting
The code is linted with [eslint](https://eslint.org/). The linter runs whenever you run the tests, but you can also run it with
```bash
yarn lint
```

### TypeScript
The code for React Spectrum is written in [TypeScript](https://www.typescriptlang.org/). The type checker will usually run in your editor, but also runs when you run
```bash
yarn lint
```

### Storybook
We use [Storybook](https://storybooks.js.org) for local development. Run the following command to start it:
```bash
yarn start
```
Then, open [http://localhost:9003](http://localhost:9003) in your browser to play around with the components and test your changes.

### Documentation
Our documentation should always remain up to date. When making changes to components, make sure the appropriate documentation has been updated to reflect those changes. Documentation for each component can be found in the docs folder within a component's package. Other documentation pages can be found in the [packages/dev/docs](https://github.com/adobe/react-spectrum/tree/main/packages/dev/docs) folder in the codebase.

Documentation can be run locally by using
```bash
yarn start:docs
```
Then, open [http://localhost:1234](http://localhost:1234) in your browser.

### Verdaccio
We use [Verdaccio](https://verdaccio.org/) to set up a private registry for our packages to test our components in our example apps. 

To run verdaccio, first ensure that your `git status` is clean. If your computer has an Intel chip, add the line `shopt -s globstar extglob` in the `verdaccio.sh` file after line 21. Save and commit these changes under a clear message like "Do not push". If you have an Apple silicon chip, you may skip this step.

Then, run the following command:
```bash
./scripts/verdaccio.sh
```

Once that is finished, open up a new terminal and change your directory to the example app you would like to test. You may test it by first running the command:
```bash
yarn install
```
And then the appropriate command to run the development server. Check the project's `package.json` for the correct command.

If you are running into issues with `yarn install` at this step, you may need to clear your yarn cache. To do this, run this following command:
```
rm -r ~/.yarn/berry/metadata/npm
yarn cache clean --all
```

Once you are finished, open the terminal where verdaccio is running and press any key to close the server. If you have an Intel chip, you will need to reset the head of your branch to exclude the change made to the `verdaccio.sh` file.

### Q & A

> `yarn build` emits a bunch of type errors?

Here are a few examples:

```
@parcel/transformer-typescript-types: Property 'style' does not exist on type 'Element'.
@parcel/transformer-typescript-types: Property 'type' does not exist on type 'EventTarget'.
@parcel/transformer-typescript-types: Property 'isContentEditable' does not exist on type 'EventTarget'
```

Yes, [that's normal](https://github.com/adobe/react-spectrum/issues/6937#issuecomment-2311492647).
It will complete successfully at the end.

> `yarn build` fails.

```
parcel build packages/@react-{spectrum,aria,stately}/*/ packages/@internationalized/{message,string,date,number}/ packages/react-aria-components --no-optimize --config .parcelrc-build
libc++abi: terminating due to uncaught exception of type std::__1::system_error: mutex lock failed: Invalid argument
make: *** [build] Abort trap: 6
parcel build packages/@react-{spectrum,aria,stately}/*/ packages/@internationalized/{message,string,date,number}/ packages/react-aria-components --no-optimize --config .parcelrc-build
make: *** [build] Segmentation fault: 11
```

It's likely that you are using a different version of Node.js. Please use Node.js 18. When changing the node version, delete `node_modules` and re-run `yarn install`

> `yarn start` fails.

For example:

```
@parcel/core: packages/@react-aria/virtualizer/src/index.ts does not export 'useVirtualizer'
```

You may have run `yarn build` before. Please run `make clean_all && yarn` to clean up the build artifacts.

It may also just be a stale cache, you can try deleting the `.parcel-cache`

## Contributor to committer

We love contributions from our community! If you'd like to go a step beyond contributor and become a committer with full write access and a say in the project, you must be invited. The existing committers employ an internal nomination process that must reach lazy consensus (silence is approval) before invitations are issued. If you feel you are qualified and want to get more deeply involved, feel free to reach out to existing committers to have a conversation.
