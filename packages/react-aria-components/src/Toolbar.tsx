/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaToolbarProps, useToolbar} from '@react-aria/toolbar';
import {ContextValue, forwardRefType, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {Orientation} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface ToolbarRenderProps {
  /**
   * The current orientation of the toolbar.
   * @selector [data-orientation]
   */
  orientation: Orientation
}

export interface ToolbarProps extends AriaToolbarProps, SlotProps, RenderProps<ToolbarRenderProps> {
}

export const ToolbarContext = createContext<ContextValue<ToolbarProps, HTMLDivElement>>({});

function Toolbar(props: ToolbarProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ToolbarContext);
  let {toolbarProps} = useToolbar(props, ref);
  let renderProps = useRenderProps({
    ...props,
    values: {orientation: props.orientation || 'horizontal'},
    defaultClassName: 'react-aria-Toolbar'
  });
  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(toolbarProps, DOMProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-orientation={props.orientation || 'horizontal'}>
      {renderProps.children}
    </div>
  );
}

/**
 * A toolbar is a container for a set of interactive controls, such as buttons, dropdown menus, or checkboxes,
 * with arrow key navigation.
 */
const _Toolbar = /*#__PURE__*/ (forwardRef as forwardRefType)(Toolbar);
export {_Toolbar as Toolbar};
