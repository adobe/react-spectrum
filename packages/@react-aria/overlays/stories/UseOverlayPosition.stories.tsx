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

import {mergeProps} from '@react-aria/utils';
import {Placement} from '@react-types/overlays';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {storiesOf} from '@storybook/react';
import {useOverlayPosition, useOverlayTrigger} from '../src';
import {useOverlayTriggerState} from '@react-stately/overlays';

function Trigger(props: {
  withPortal: boolean,
  placement: Placement,
  maxHeight?: number,
  buttonWidth?: number
}) {
  const {withPortal, placement, maxHeight, buttonWidth} = props;
  const targetRef = React.useRef<HTMLButtonElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const state = useOverlayTriggerState({
    defaultOpen: false
  });
  const {triggerProps, overlayProps} = useOverlayTrigger({
    type: 'menu'
  }, state, targetRef);
  const {overlayProps: overlayPositionProps} = useOverlayPosition({
    targetRef,
    overlayRef,
    shouldFlip: false,
    isOpen: state.isOpen,
    offset: 10,
    placement,
    maxHeight
  });

  let overlay = (
    <div
      ref={overlayRef}
      {...mergeProps(overlayProps, overlayPositionProps)}
      style={{
        ...overlayPositionProps.style,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.25)',
        backgroundColor: 'white',
        overflow: 'auto'
      }}>
      <ul
        style={{
          padding: 10,
          margin: 0,
          listStyleType: 'none'
        }}>
        {maxHeight
          ? [...Array(20)].map((_, i) => <li>Hello {i}</li>)
          : [...Array(5)].map((_, i) => <li>Hello {i}</li>)
        }
      </ul>
    </div>
  );

  if (withPortal) {
    overlay = ReactDOM.createPortal(overlay, document.body);
  }
  return (
    <div style={{position: 'relative', margin: 'auto'}}>
      <button
        ref={targetRef}
        {...triggerProps}
        style={{width: buttonWidth}}
        onClick={() => state.toggle()}>
        Trigger (open: {`${state.isOpen}`})
      </button>
      {state.isOpen && overlay}
    </div>
  );
}

storiesOf('UseOverlayPosition', module)
  .add('document.body container bottom', () => <Trigger withPortal placement="bottom" />)
  .add('document.body container top', () => <Trigger withPortal placement="top" />)
  .add('positioned container bottom', () => <Trigger withPortal={false} placement="bottom" />)
  .add('positioned container top', () => <Trigger withPortal={false} placement="top" />)
  .add('buttonWidth=500 document.body bottom start', () => <Trigger withPortal buttonWidth={500} placement="bottom start" />)
  .add('maxHeight=200 container bottom', () => <Trigger withPortal maxHeight={200} placement="bottom" />)
  .add('maxHeight=200 container top', () => <Trigger withPortal maxHeight={200} placement="top" />);
