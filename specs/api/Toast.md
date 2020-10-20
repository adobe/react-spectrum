<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

Toast use cases:
- stuff found in the rsp room
  - have toast last an indefinite amount of time (has progress bar inside it)
  - show toast after an operation finishes (upload complete, form saved etc)
    - also for error messaging (but not form validation)
  - lotta requests for help positioning it
- v2 stories (support the same stuff available there?)
- https://git.corp.adobe.com/io-sdk/willow/blob/492f02a527c1de111f9ea4246c262360f70684a1/src/components/AppsPage/AppsPageLayout.js
  - toast appears to notify iOS support and other info
- https://git.corp.adobe.com/adobe-platform/ethos-homepage/blob/4327571c748e17f34af603246e8ec88e82b73397/comps/featurecomps/AddNewFlag.tsx
  - notification toast for feature flag creation success and failure (validation)
- https://git.corp.adobe.com/di-services-3d/dncr-gltf-viewer/blob/5344620e96e4e1d14587cbb749df58130bca1418/src/AbuseForm.js
  - notification (success or failure) for abuse report submission
- https://git.corp.adobe.com/aem-eng-ops/aem-headcount/blob/14275b2f4c4ca9ccb7c4f5eeea45dfdad1668b95/ui/src/views/login/Login.js
  - error toast for authentication

Research:
- looked at MaterialUI, Ant, and ReactBootstrap
- similar api for the most part
  - some form of variant, timeout, onClose, positioning handling, transition customization, message customization
- Ant has users render the toast (notification) via notification.[variant]({config}) instead of the typical <Toast /> format. Also no controlled 'open/show' prop
  - MaterialUI and ReactBootstrap were more "normal", e.g. <Toast /> + having a "show/open" prop
- none of them really handled queuing or making sure only a single toast was rendered at a time
  - up to user to handle that behavior

https://w3c.github.io/aria-practices/examples/alert/alert.html
https://github.com/adobe/react-spectrum/blob/main/specs/accessibility/Toast.mdx


Questions:
- where is the line drawn for spectrum behavior here?
  - is it the queue logic (aka the 1 through 8 priority), or is it the fact that there is a queue at all and we disallow displaying more than one toast at a time
    - how much customization would we want to allow for priority logic/bypassing said logic
- how flexible do we want toast customization to be?
  - positioning? should it always be at the bottom or should be users the ability to customize positioning freely?
- what about transitioning, should we allow customization of this?


```typescript
interface ToastProps {
  // Variant of the toast, default is 'neutral
  variant?: 'neutral' | 'informative' | 'positive' | 'negative',

  // Whether or not the toast is closable via a 'x' button (not sure if we want this one still, was in v2)
  isDismissible?: boolean,

  // Callback when toast is dismissed
  onDismiss? () => void

  // sets how long the toast remains on screen before automatically dismissing itself. Without it being set, the toast remains indefinitely
  autoDismissDuration? number

  // The contents of the toast
  children: ReactNode

  // The label for the optional action button.
  actionLabel?: ReactNode

  // Callback when toast is actioned upon
  onAction? () => void

  // Unique identifier, autogenerate if not provided
  key?: string,

  // Callback for when the toast has fully transitioned out
  onExit?: () => void,
}


interface ToastAria {
  // props for the toast div (role = "alert" is it basically)
  toastProps: HTMLAttributes<HTMLDivElement>,

  // props for close button (aria-label = "close", press handlers that call props.onDismiss)
  closeButtonProps: ButtonHTMLAttributes<HTMLButtonElement>,

  // aria props for action button (press handlers that call props.onAction, not sure about any aria attributes couldn't find any)
  actionButtonProps: ButtonHTMLAttributes<HTMLButtonElement>
}

function useToast(props: ToastProps, state: ToastState): ToastAria;
```

To handle queuing:

- Need some global state that tracks what toast is visible, what toasts are in queue, and returns functions for adding/removing toasts
  - It would get called at the Provider level and the state made available via context (if used by itself)
  - A spectrum component called ToastContainer or something would be made available for react-spectrum package consumers. It would sets up a context to provide this global state to all children
    - Would need to be top level element in tree
  - via context provides addToast that accepts a JSX Toast element as arg
    - e.g. addToast(<Toast variant='warning'...>)

```typescript
interface ToastContainerProps {
  // Prop that allow the user to specify where the container should be located on the page
  // where to position the ToastContainer? would the toast appear at the bottom of the container it was placed in or portalled out so it is at the bottom of the screen?
  // theming?
  // option to portal?
  position/placement?
}


interface ToastContainerState {
  // returns what toast is currently visible
  visibleToast: ToastElement

  // Setter for what toast to display. Returned here in case user wants to ignore priority logic and set what toast should be visible
  setVisibleToastProps: (ToastElement) => void

  // Object that contains the current toast queue. Not entirely sure what is the best structure
  // Flat array?
  // A object w/ keys 1 through 8 (priority level), which has arrays w/ toasts associated with each?
  // e.g {"1": [toast1, toast 2], "2": [toast3], "3": [], "4": [toast 4], etc}
  // A map of maps? The outer map has keys 1 through 8 for priority, then each key is associated to a map with toastKeys as keys? This allows for priority + toast key lookup while we can still use map.get(priority).values[first] to get the next toast in queue
  toastQueue: Object()

  // Setter to modify toast queue. Returned here if the user want to modify the queue directly (wipe the queue, etc)
  setToastQueue:

  // Adds a toast to the queue. Needs a unique identifier so toast look up can happen via removeToast
  addToast: (ToastElement, id/key) => void

  // Removes a toast regardless if it is visible or in queue. Uses the provided id/key to match what toast to remove
  // This would get called after onDismiss
  removeToast: (id/key) => void
}

 - perhaps a way to customize toast priority logic is added here
// Function that overrides the default priority logic. Consumes toast props and returns a priority number
  determinePriorityFn: (props) => number

function useToastContainerState(): ToastContainerState;


interface ToastContainerAria {
  // landmark roles, not 100% on this?
  role: 'region',
  aria-label: 'Notifications'
}

function useToastContainer(): ToastContainerAria;
```
