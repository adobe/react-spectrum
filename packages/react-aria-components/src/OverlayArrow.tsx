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

import {ContextValue, forwardRefType, RenderProps, useContextProps, useRenderProps} from './utils';
import {PlacementAxis} from 'react-aria';
import React, {createContext, CSSProperties, ForwardedRef, forwardRef, HTMLAttributes} from 'react';

interface OverlayArrowContextValue extends OverlayArrowProps {
  placement: PlacementAxis
}

export const OverlayArrowContext = createContext<ContextValue<OverlayArrowContextValue, HTMLDivElement>>({
  placement: 'bottom'
});

export interface OverlayArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'>, RenderProps<OverlayArrowRenderProps> {}

export interface OverlayArrowRenderProps {
  /**
   * The placement of the overlay relative to the trigger.
   * @selector [data-placement="left | right | top | bottom"]
   */
  placement: PlacementAxis
}

function OverlayArrow(props: OverlayArrowProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, OverlayArrowContext);
  let placement = (props as OverlayArrowContextValue).placement;
  let style: CSSProperties = {
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
  // remove undefined values from renderProps.style object so that it can be
  // spread merged with the other style object
  if (renderProps.style) {
    Object.keys(renderProps.style).forEach(key => renderProps.style![key] === undefined && delete renderProps.style![key]);
  }

  return (
    <div
      {...props}
      {...renderProps}
      style={{
        ...style,
        ...renderProps.style
      }}
      ref={ref}
      data-placement={placement} />
  );
}

/**
 * An OverlayArrow renders a custom arrow element relative to an overlay element
 * such as a popover or tooltip such that it aligns with a trigger element.
 */
const _OverlayArrow = /*#__PURE__*/ (forwardRef as forwardRefType)(OverlayArrow);
export {_OverlayArrow as OverlayArrow};
