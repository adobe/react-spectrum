<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2020-09-28
- RFC PR: (leave this empty, to be filled in later)
- Authors: Ross Pfahler, Jorge Parga

# React Spectrum v3 Component Telemetry

## Summary

React Spectrum should provide a way to compile usage data of which components are being used in an application. It should allow consumers a way to optionally provide their own collector of this information. It will not collect, store, or log anything by default. The initial version is scoped to only provide the ability to glean  which components are used at a certain time in the application.

## Motivation

Tracking what components are used in a particular application is quite useful and can tie into other existing telementry systems. Having the start of a system in place sets the team up to provide additional functionality in this area going forward, specifically with a focus around performance of the components themselves (think slow renders, logging warnings about improper usage).

For usage specifically at Adobe (or other large enterprises), knowing what versions of React Spectrum v3 are being used by applications as well specifically which components allows the core team to make responsible decisions and prioritize efforts. It can make migrations easier and it helps provides a baseline of the "usefulness" of certain components.

So, this system isn't about user tracking -- nor does it intend to go that direction.

## Detailed Design

### API

In order to compile usage data of components, two new APIs will need to be introduced:
1. a `useTelemetry` hook
2. a `TelemetryProvider` component

```tsx
interface ArbitraryData {
  [key: string]: any;
}

interface useTelemetryApi extends ArbitraryData {
  track(event: string): void;
}

type useTelementry(metadata?: ArbitraryData): useTelemetryApi;

interface TelemetryProvider {
  track(event: string, metadata: ArbitraryData, context: ArbitraryData): void;
}
```

- `metadata` is set at track calltime -- it is used for specific information related to context of the event. Examples include `componentName` and other locally (local to the component) identifying information.
- `context` is data set at the provider level that is included with each track call. Examples include items like `userId`, `orgId` and other globally identifying information.

This telemetry object only has one method at the moment. A user would do the following to get the components on the page:

```jsx
import {TelemetryProvider} from '@adobe/react-spectrum`;
import {myInternalTelemetry} from './telemetry';

let myTelemetry = {
  track: (event, {componentName}, {userId, orgId}) {
    myInternalTelemetry.track({event, source: 'react-spectrum'}, componentName, userId, orgId);
  },
  contextSetters: ['userId', 'orgId']
}

function MyApp() {
  return (
    <TelemetryProvider {...myTelemetry}>
      <div>
       ...
      </div>
    </TelemetryProvider>
  );
}
```

import {useTelemetry} from '@adobe/react-spectrum`;

```jsx
function MyComponent(props) {
  const metadata = {componentName: Component.displayName};
  let {orgId, userId, track} = useTelemetry(metadata)();
  userId = 'user123';
  orgId = 'orgABC';
  track(event1);
  ...
  track(event2);
  ...
```

## Documentation

The new APIs will need documentation.

## Drawbacks

### "Telemetry" has negative connotations

In some communities the word "telemetry" has an association with what is perceived as an increasing lack of privacy online. However, this proposal is not intending to track user-centric information -- only which components are used by an application. Additionally, only the component names of React Spectrum components are  to be given the ability to be tracked.

Additionally, this proposal does not enable this feature by default nor gives any guide to how to implement handlers of component registration events.

### Additional code weight

This adds additional bytes to each component. It will mostly be eaten up by compression, but it will still add size.

We can (and should) mitigate this extra weight by using environmental variables to skip and remove the extra weight of the telemetry code from components:

```jsx
function Component(props) {
  if (process.env.RSP_EXCLUDE_TELEMETRY) {
    useTelemetry();
  }
  ...
}
```

Any reasonable bundler + minifier would thus compile this away in the case that `RSP_EXCLUDE_TELEMETRY` was set.

## Backwards Compatibility Analysis

This is expected to be backwards compatible and opt-in (in the sense that it will no-op in the default case).

## Alternatives

### Adding a new provider

A new provider type could be added -- a `TelemetryProvider`. This is a common pattern with standalone implementations of telemetry systems:
- https://github.com/microsoft/ApplicationInsights-JS/tree/master/extensions/applicationinsights-react-js
- https://github.com/NYTimes/react-tracking (in this case it is a decorator)

The configuration would happen here.

Drawbacks include the fact that applications now would have even more providers to set up.

### Use an existing 3rd party

We do not want to build a general purpose telemetry system for React. That rules out [some](https://github.com/nytimes/react-tracking) projects. 

We do not want to build to a propertatry backend, such as Google Analytics or Adobe Analytics. That rules out [others](https://github.com/react-ga/react-ga).

Because our scope is initially small, it is worth keeping in mind that the code will be small. It is not expected to be exposed externally, as and as such, the API will be iterated on as more is learned.

## Open Questions

- Will function names be collapsed / re-written at build time? So, would there need to be additional attributes for reach function. Is this a good use case for a Babel plugin?
- Do versions matter? Components are individually versioned now, so this would include much more information. Additionally, should this be included anyways? It would be useful for debugging.
- Should this be expanded to be a general purpose telemetry system eventually? (i hope not, but we should discuss).

## Help Needed

The core team should help here :)

## Frequently Asked Questions

This section will be filled in as questions are asked.

## Related Discussions

n/a
