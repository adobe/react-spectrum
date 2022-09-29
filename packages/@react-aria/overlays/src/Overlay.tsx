/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FocusScope} from '@react-aria/focus';
import React, {ReactNode, useContext, useState} from 'react';
import ReactDOM from 'react-dom';
import {useIsSSR} from '@react-aria/ssr';
import {useLayoutEffect} from '@react-aria/utils';

export interface OverlayProps {
  /**
   * The container element in which the overlay portal will be placed.
   * @default document.body
   */
  portalContainer?: Element,
  /** The overlay to render in the portal. */
  children: ReactNode
}

const OverlayContext = React.createContext(null);

/**
 * A container which renders an overlay such as a popover or modal in a portal,
 * and provides a focus scope for the child elements.
 */
export function Overlay(props: OverlayProps) {
  let isSSR = useIsSSR();
  let {portalContainer = isSSR ? null : document.body} = props;
  let [contain, setContain] = useState(false);

  if (!portalContainer) {
    return null;
  }

  let contents = (
    <OverlayContext.Provider value={setContain}>
      <FocusScope restoreFocus contain={contain}>
        {props.children}
      </FocusScope>
    </OverlayContext.Provider>
  );

  return ReactDOM.createPortal(contents, portalContainer);
}

/** @private */
export function useOverlayFocusContain() {
  let setContain = useContext(OverlayContext);
  useLayoutEffect(() => {
    setContain?.(true);
  }, [setContain]);
}
