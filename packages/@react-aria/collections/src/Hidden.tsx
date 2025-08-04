/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {forwardRefType} from '@react-types/shared';
import React, {Context, createContext, forwardRef, JSX, ReactElement, ReactNode, useContext} from 'react';

// React doesn't understand the <template> element, which doesn't have children like a normal element.
// It will throw an error during hydration when it expects the firstChild to contain content rendered
// on the server, when in reality, the browser will have placed this inside the `content` document fragment.
// This monkey patches the firstChild property for our special hidden template elements to work around this error.
// See https://github.com/facebook/react/issues/19932
if (typeof HTMLTemplateElement !== 'undefined') {
  const getFirstChild = Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild')!.get!;
  Object.defineProperty(HTMLTemplateElement.prototype, 'firstChild', {
    configurable: true,
    enumerable: true,
    get: function () {
      if (this.dataset.reactAriaHidden) {
        return this.content.firstChild;
      } else {
        return getFirstChild.call(this);
      }
    }
  });
}

export const HiddenContext: Context<boolean> = createContext<boolean>(false);

export function Hidden(props: {children: ReactNode}): JSX.Element {
  let isHidden = useContext(HiddenContext);
  if (isHidden) {
    // Don't hide again if we are already hidden.
    return <>{props.children}</>;
  }

  let children = (
    <HiddenContext.Provider value>
      {props.children}
    </HiddenContext.Provider>
  );

  // In SSR, portals are not supported by React. Instead, always render into a <template>
  // element, which the browser will never display to the user. In addition, the
  // content is not part of the accessible DOM tree, so it won't affect ids or other accessibility attributes.
  return <template data-react-aria-hidden>{children}</template>;
}

/** Creates a component that forwards its ref and returns null if it is in a hidden subtree. */
// Note: this function is handled specially in the documentation generator. If you change it, you'll need to update DocsTransformer as well.
export function createHideableComponent<T, P = {}>(fn: (props: P, ref: React.Ref<T>) => ReactElement | null): (props: P & React.RefAttributes<T>) => ReactElement | null {
  let Wrapper = (props: P, ref: React.Ref<T>) => {
    let isHidden = useContext(HiddenContext);
    if (isHidden) {
      return null;
    }

    return fn(props, ref);
  };
  // @ts-ignore - for react dev tools
  Wrapper.displayName = fn.displayName || fn.name;
  return (forwardRef as forwardRefType)(Wrapper);
}

/** Returns whether the component is in a hidden subtree. */
export function useIsHidden(): boolean {
  return useContext(HiddenContext);
}
