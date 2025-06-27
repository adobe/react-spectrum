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

import {AriaPopoverProps, DismissButton, PopoverAria, usePopover} from '@react-aria/overlays';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, RefObject, StyleProps} from '@react-types/shared';
import {FocusWithinProps, useFocusWithin} from '@react-aria/interactions';
import {mergeProps, useLayoutEffect, useObjectRef} from '@react-aria/utils';
import {Overlay} from './Overlay';
import {OverlayTriggerState} from '@react-stately/overlays';
import overrideStyles from './overlays.css';
import React, {ForwardedRef, forwardRef, ReactNode, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/popover/vars.css';
import {Underlay} from './Underlay';

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef' | 'maxHeight'>, FocusWithinProps, StyleProps {
  children: ReactNode,
  hideArrow?: boolean,
  state: OverlayTriggerState,
  shouldContainFocus?: boolean,
  onEntering?: () => void,
  onEnter?: () => void,
  onEntered?: () => void,
  onExiting?: () => void,
  onExited?: () => void,
  onExit?: () => void,
  container?: HTMLElement,
  disableFocusManagement?: boolean,
  enableBothDismissButtons?: boolean,
  onDismissButtonPress?: () => void
}

interface PopoverWrapperProps extends PopoverProps, FocusWithinProps {
  isOpen?: boolean,
  wrapperRef: RefObject<HTMLDivElement | null>
}

interface ArrowProps {
  arrowProps: PopoverAria['arrowProps'],
  isLandscape: boolean,
  arrowRef?: RefObject<SVGSVGElement | null>,
  primary: number,
  secondary: number,
  borderDiagonal: number
}

/**
 * Arrow placement can be done pointing right or down because those paths start at 0, x or y. Because the
 * other two don't, they start at a fractional pixel value, it introduces rounding differences between browsers and
 * between display types (retina with subpixels vs not retina). By flipping them with CSS we can ensure that
 * the path always starts at 0 so that it perfectly overlaps the popover's border.
 * See bottom of file for more explanation.
 */
let arrowPlacement = {
  left: 'right',
  right: 'right',
  top: 'bottom',
  bottom: 'bottom'
};

export const Popover = forwardRef(function Popover(props: PopoverProps, ref: DOMRef<HTMLDivElement>) {
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
});

const PopoverWrapper = forwardRef((props: PopoverWrapperProps, ref: ForwardedRef<HTMLDivElement | null>) => {
  let {
    children,
    isOpen,
    hideArrow,
    isNonModal,
    enableBothDismissButtons,
    state,
    wrapperRef,
    onDismissButtonPress = () => state.close()
  } = props;
  let {styleProps} = useStyleProps(props);
  let objRef = useObjectRef(ref);

  let {size, borderWidth, arrowRef} = useArrowSize();
  const borderRadius = usePopoverBorderRadius(objRef);
  let borderDiagonal = borderWidth * Math.SQRT2;
  let primary = size + borderDiagonal;
  let secondary = primary * 2;
  let {
    popoverProps,
    arrowProps,
    underlayProps,
    placement
  } = usePopover({
    ...props,
    popoverRef: objRef,
    maxHeight: undefined,
    arrowSize: hideArrow ? 0 : secondary,
    arrowBoundaryOffset: borderRadius
  }, state);
  let {focusWithinProps} = useFocusWithin(props);

  // Attach Transition's nodeRef to outermost wrapper for node.reflow: https://github.com/reactjs/react-transition-group/blob/c89f807067b32eea6f68fd6c622190d88ced82e2/src/Transition.js#L231
  return (
    <div ref={wrapperRef}>
      {!isNonModal && <Underlay isTransparent {...mergeProps(underlayProps)} isOpen={isOpen} /> }
      <div
        {...styleProps}
        {...mergeProps(popoverProps, focusWithinProps)}
        style={{
          ...styleProps.style,
          ...popoverProps.style
        }}
        ref={objRef}
        className={
          classNames(
            styles,
            'spectrum-Popover',
            `spectrum-Popover--${placement}`,
            {
              'spectrum-Popover--withTip': !hideArrow,
              'is-open': isOpen,
              [`is-open--${placement}`]: isOpen
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
        {(!isNonModal || enableBothDismissButtons) && <DismissButton onDismiss={onDismissButtonPress} />}
        {children}
        {hideArrow ? null : (
          <Arrow
            arrowProps={arrowProps}
            isLandscape={placement != null ? arrowPlacement[placement] === 'bottom' : false}
            arrowRef={arrowRef}
            primary={primary}
            secondary={secondary}
            borderDiagonal={borderDiagonal} />
        )}
        <DismissButton onDismiss={onDismissButtonPress} />
      </div>
    </div>
  );
});

function usePopoverBorderRadius(popoverRef: RefObject<HTMLDivElement | null>) {
  let [borderRadius, setBorderRadius] = useState(0);
  useLayoutEffect(() => {
    if (popoverRef.current) {
      let spectrumBorderRadius = window.getComputedStyle(popoverRef.current).borderRadius;
      if (spectrumBorderRadius !== '') {
        setBorderRadius(parseInt(spectrumBorderRadius, 10));
      }
    }
  }, [popoverRef]);
  return borderRadius;
}

function useArrowSize() {
  let [size, setSize] = useState(20);
  let [borderWidth, setBorderWidth] = useState(1);
  let arrowRef = useRef<SVGSVGElement>(null);
  // get the css value for the tip size and divide it by 2 for this arrow implementation
  useLayoutEffect(() => {
    if (arrowRef.current) {
      let spectrumTipWidth = window.getComputedStyle(arrowRef.current)
        .getPropertyValue('--spectrum-popover-tip-size');
      if (spectrumTipWidth !== '') {
        setSize(parseInt(spectrumTipWidth, 10) / 2);
      }

      let spectrumBorderWidth = window.getComputedStyle(arrowRef.current)
        .getPropertyValue('--spectrum-popover-tip-borderWidth');
      if (spectrumBorderWidth !== '') {
        setBorderWidth(parseInt(spectrumBorderWidth, 10));
      }
    }
  }, []);
  return {size, borderWidth, arrowRef};
}

function Arrow(props: ArrowProps) {
  let {primary, secondary, isLandscape, arrowProps, borderDiagonal, arrowRef} = props;
  let halfBorderDiagonal = borderDiagonal / 2;

  let primaryStart = 0;
  let primaryEnd = primary - halfBorderDiagonal;

  let secondaryStart = halfBorderDiagonal;
  let secondaryMiddle = secondary / 2;
  let secondaryEnd = secondary - halfBorderDiagonal;

  let pathData = isLandscape ? [
    'M', secondaryStart, primaryStart,
    'L', secondaryMiddle, primaryEnd,
    'L', secondaryEnd, primaryStart
  ] : [
    'M', primaryStart, secondaryStart,
    'L', primaryEnd, secondaryMiddle,
    'L', primaryStart, secondaryEnd
  ];

  /* use ceil because the svg needs to always accommodate the path inside it */
  return (
    <svg
      xmlns="http://www.w3.org/svg/2000"
      width={Math.ceil(isLandscape ? secondary : primary)}
      height={Math.ceil(isLandscape ? primary : secondary)}
      className={classNames(styles, 'spectrum-Popover-tip')}
      ref={arrowRef}
      {...arrowProps}>
      <path className={classNames(styles, 'spectrum-Popover-tip-triangle')} d={pathData.join(' ')} />
    </svg>
  );
}

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
