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

import {mergeProps} from '@react-aria/utils';
import {PlacementAxis} from 'react-aria';
import React, {createContext, CSSProperties, ForwardedRef, forwardRef, HTMLAttributes, useContext} from 'react';
import {RenderProps, useRenderProps} from './utils';

interface OverlayArrowContextValue {
  arrowProps: HTMLAttributes<HTMLElement>,
  placement: PlacementAxis
}

export const OverlayArrowContext = createContext<OverlayArrowContextValue | null>(null);

export interface OverlayArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'>, RenderProps<OverlayArrowRenderProps> {}

export interface OverlayArrowRenderProps {
  /**
   * The placement of the overlay relative to the trigger.
   * @selector [data-placement="left | right | top | bottom"]
   */
  placement: PlacementAxis
}

function OverlayArrow(props: OverlayArrowProps, ref: ForwardedRef<HTMLDivElement>) {
  let {arrowProps, placement} = useContext(OverlayArrowContext)!;
  let style: CSSProperties = {
    ...arrowProps.style,
    position: 'absolute',
    [placement]: '100%',
    transform: placement === 'top' || placement === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'
  };

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-OverlayArrow',
    values: {
      placement
    }
  });

  return (
    <div
      {...mergeProps(arrowProps, props)}
      {...renderProps}
      style={{
        ...renderProps.style,
        ...style
      }}
      ref={ref}
      data-placement={placement} />
  );
}

/**
 * An OverlayArrow renders a custom arrow element relative to an overlay element
 * such as a popover or tooltip such that it aligns with a trigger element.
 */
const _OverlayArrow = forwardRef(OverlayArrow);
export {_OverlayArrow as OverlayArrow};
