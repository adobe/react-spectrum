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

import React, {createContext, ReactNode, useContext} from 'react';

export interface PortalProviderProps {
  /** Should return the element where we should portal to. Can clear the context by passing null. */
  getContainer?: () => HTMLElement | null,
  /** The content of the PortalProvider. Should contain all children that want to portal their overlays to the element returned by the provided `getContainer()`. */
  children: ReactNode
}

export interface PortalProviderContextValue extends Omit<PortalProviderProps, 'children'>{};

export const PortalContext = createContext<PortalProviderContextValue>({});

/**
 * Sets the portal container for all overlay elements rendered by its children.
 */
export function UNSAFE_PortalProvider(props: PortalProviderProps): ReactNode {
  let {getContainer} = props;
  let {getContainer: ctxGetContainer} = useUNSAFE_PortalContext();
  return (
    <PortalContext.Provider value={{getContainer: getContainer === null ? undefined : getContainer ?? ctxGetContainer}}>
      {props.children}
    </PortalContext.Provider>
  );
}

export function useUNSAFE_PortalContext(): PortalProviderContextValue {
  return useContext(PortalContext) ?? {};
}
