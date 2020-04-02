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

import {classNames, DOMEventPropNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {MenuContext} from './context';
import {MenuItem} from './MenuItem';
import {MenuSection} from './MenuSection';
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement, useContext, useEffect} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenu} from '@react-aria/menu';
import {useTreeState} from '@react-stately/tree';

function Menu<T>(props: SpectrumMenuProps<T>, ref: DOMRef<HTMLUListElement>) {
  let contextProps = useContext(MenuContext);
  let completeProps = {
    ...mergeProps(contextProps, props),
    selectionMode: props.selectionMode || 'none'
  };

  let domRef = useDOMRef(ref);
  let state = useTreeState(completeProps);
  let {menuProps} = useMenu({...completeProps, ref: domRef}, state);
  let {styleProps} = useStyleProps(completeProps);

  // Sync ref from <MenuTrigger> context with DOM ref.
  useEffect(() => {
    if (contextProps && contextProps.ref) {
      contextProps.ref.current = domRef.current;
      return () => {
        contextProps.ref.current = null;
      };
    }
  }, [contextProps, domRef]);

  return (
    <ul
      {...filterDOMProps(completeProps)}
      // Allow DOM props to be passed from MenuTrigger via context only
      {...mergeProps(menuProps, filterDOMProps(contextProps, DOMEventPropNames))}
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles, 
          'spectrum-Menu',
          styleProps.className
        )
      }>
      {[...state.collection].map(item => {
        if (item.type === 'section') {
          return (
            <MenuSection 
              key={item.key}
              item={item}
              state={state}
              onAction={completeProps.onAction} />
          );
        }

        let menuItem = (
          <MenuItem
            key={item.key}
            item={item}
            state={state}
            onAction={completeProps.onAction} />
        );

        if (item.wrapper) {
          menuItem = item.wrapper(menuItem);
        }

        return menuItem;
      })}
    </ul>
  );
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Menu = React.forwardRef(Menu) as <T>(props: SpectrumMenuProps<T> & {ref?: DOMRef<HTMLUListElement>}) => ReactElement;
export {_Menu as Menu};
