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

import {AriaPopoverProps, DismissButton, usePopover} from '@react-aria/overlays';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, StyleProps} from '@react-types/shared';
import {Overlay} from '@react-spectrum/overlays';
import {OverlayTriggerState} from '@react-stately/overlays';
import overrideStyles from './overlays.css';
import React, {forwardRef, MutableRefObject, ReactNode, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/popover/vars.css';

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef' | 'maxHeight'>, StyleProps {
  children: ReactNode,
  state: OverlayTriggerState,
  shouldContainFocus?: boolean,
  shouldRestoreFocus?: boolean,
  onExit?: () => void,
  container: HTMLElement
}

interface PopoverWrapperProps extends PopoverProps {
  isOpen?: boolean,
  wrapperRef: MutableRefObject<HTMLDivElement>
}

function Popover(props: PopoverProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    state,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <Overlay {...otherProps} isOpen={state.isOpen} nodeRef={wrapperRef}>
      <PopoverWrapper ref={domRef} {...props} wrapperRef={wrapperRef}>
        {children}
      </PopoverWrapper>
    </Overlay>
  );
}

const PopoverWrapper = forwardRef((props: PopoverWrapperProps, ref: RefObject<HTMLDivElement>) => {
  let {
    children,
    isOpen,
    state,
    wrapperRef
  } = props;
  let {styleProps} = useStyleProps(props);

  let {popoverProps, placement} = usePopover({
    ...props,
    popoverRef: ref,
    maxHeight: null
  }, state);

  // Attach Transition's nodeRef to outermost wrapper for node.reflow: https://github.com/reactjs/react-transition-group/blob/c89f807067b32eea6f68fd6c622190d88ced82e2/src/Transition.js#L231
  return (
    <div ref={wrapperRef}>
      <div
        {...styleProps}
        {...popoverProps}
        style={{
          ...styleProps.style,
          ...popoverProps.style
        }}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Popover',
            `spectrum-Popover--${placement}`,
            {
              'is-open': isOpen
            },
            classNames(
              overrideStyles,
              'spectrum-Popover',
              'react-spectrum-Popover'
            ),
            styleProps.className
          )
        }
        role="presentation"
        data-testid="popover">
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </div>
  );
});

let _Popover = forwardRef(Popover);
export {_Popover as Popover};

/**
 * More explanation on popover tips.
 * - I tried changing the calculation of the popover placement in an effort to get it squarely onto the pixel grid.
 * This did not work because the problem was in the svg partial pixel end of the path in the popover right and popover bottom.
 * - I tried creating an extra 'bandaid' path that matched the background color and would overlap the popover border.
 * This didn't work because the border on the svg triangle didn't extend all the way to match nicely with the popover border.
 * - I tried getting the client bounding box and setting the svg to that partial pixel value
 * This didn't work because again the issue was inside the svg
 * - I didn't try drawing the svg backwards
 * This could still be tried
 * - I tried changing the calculation of the popover placement AND the svg height/width so that they were all rounded
 * This seems to have done the trick.
 */
