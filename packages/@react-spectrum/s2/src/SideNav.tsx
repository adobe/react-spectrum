/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButtonGroupContext} from './ActionButtonGroup';
import {ActionMenuContext} from './ActionMenu';
import {
  Button,
  ButtonContext,
  ListLayout,
  Provider,
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemContentProps,
  useContextProps,
  Virtualizer
} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {colorMix, focusRing, fontRelative, lightDark, style} from '../style' with {type: 'macro'};
import {DOMRef, Key} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {isAndroid} from '@react-aria/utils';
import {raw} from '../style/style-macro' with {type: 'macro'};
import React, {createContext, forwardRef, JSXElementConstructor, ReactElement, ReactNode, useContext, useRef} from 'react';
import {TextContext} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale} from 'react-aria';
import {useScale} from './utils';

export interface SideNavProps extends Omit<RACTreeProps<any>, 'style' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks'>, UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

interface TreeRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});


export interface TreeViewItemProps extends Omit<RACTreeItemProps, 'className' | 'style'> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean
}

const tree = style({
  ...focusRing(),
  outlineOffset: -2, // make certain we are visible inside overflow hidden containers
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  width: 'full',
  height: 'full',
  overflow: 'auto',
  boxSizing: 'border-box',
  justifyContent: {
    isEmpty: 'center'
  },
  alignItems: {
    isEmpty: 'center'
  },
  '--indent': {
    type: 'width',
    value: 16
  }
}, getAllowedOverrides({height: true}));

function SideNav(props: SideNavProps, ref: DOMRef<HTMLDivElement>) {
  let {children, UNSAFE_className, UNSAFE_style} = props;
  let scale = useScale();

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: scale === 'large' ? 50 : 40
      }}>
      <TreeRendererContext.Provider value={{renderer}}>
          <Tree
            {...props}
            style={UNSAFE_style}
            className={renderProps => (UNSAFE_className ?? '') + tree({...renderProps}, props.styles)}
            selectionBehavior="toggle"
            ref={domRef}>
            {props.children}
          </Tree>
      </TreeRendererContext.Provider>
    </Virtualizer>
  );
}


export const SideNavItem = (props: TreeViewItemProps): ReactNode => {
  let {
    href
  } = props;

  return (
    <TreeItem
      {...props} />
  );
};

/**
 * A side nav lets users navigate the entire content of a product or a section.
 */
const _SideNav = forwardRef(SideNav);
export {_SideNav as SideNav};