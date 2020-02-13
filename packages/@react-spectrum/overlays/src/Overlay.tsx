/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {DOMRef} from '@react-types/shared';
import {OpenTransition} from './OpenTransition';
import {Provider} from '@react-spectrum/provider';
import React, {ReactNode, useCallback, useState} from 'react';
import ReactDOM from 'react-dom';

interface OverlayProps {
  children: ReactNode,
  isOpen?: boolean,
  container?: Element,
  onEnter?: () => void,
  onEntering?: () => void,
  onEntered?: () => void,
  onExit?: () => void,
  onExiting?: () => void,
  onExited?: () => void
}

function Overlay(props: OverlayProps, ref: DOMRef<HTMLDivElement>) {
  let {children, isOpen, container, onEnter, onEntering, onEntered, onExit, onExiting, onExited} = props;
  let [exited, setExited] = useState(!isOpen);

  let handleEntered = useCallback(() => {
    setExited(false);
    if (onEntered) {
      onEntered();
    }
  }, [onEntered]);

  let handleExited = useCallback(() => {
    setExited(true);
    if (onExited) {
      onExited();
    }
  }, [onExited]);

  // Don't un-render the overlay while it's transitioning out.
  let mountOverlay = isOpen || !exited;
  if (!mountOverlay) {
    // Don't bother showing anything if we don't have to.
    return null;
  }

  let contents = (
    <Provider ref={ref} UNSAFE_style={{position: 'absolute', zIndex: 100000, top: 0, left: 0}}>
      <OpenTransition
        in={isOpen}
        appear
        onExit={onExit}
        onExiting={onExiting}
        onExited={handleExited}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={handleEntered}>
        {children}
      </OpenTransition>
    </Provider>
  );

  return ReactDOM.createPortal(contents, container || document.body);
}

let _Overlay = React.forwardRef(Overlay);
export {_Overlay as Overlay};
