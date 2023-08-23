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

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import {MenuContext, MenuStateContext, useMenuStateContext} from './context';
import {MenuItem} from './MenuItem';
import {MenuSection} from './MenuSection';
import {mergeProps, useSyncRef} from '@react-aria/utils';
import React, {ReactElement, useContext, useRef} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenu} from '@react-aria/menu';
import {useTreeState} from '@react-stately/tree';

function Menu<T extends object>(props: SpectrumMenuProps<T>, ref: DOMRef<HTMLUListElement>) {
  let contextProps = useContext(MenuContext);
  let parentMenuContext = useMenuStateContext();
  let {topLevelonAction, topLevelMenuState} = parentMenuContext || {};
  if (!parentMenuContext) {
    topLevelonAction = props.onAction;
    topLevelMenuState = contextProps.state;
  }
  let completeProps = {
    ...mergeProps(contextProps, {onAction: topLevelonAction, ...props})
  };

  let domRef = useDOMRef(ref);
  let scopedRef = useRef(null);
  let state = useTreeState(completeProps);
  // TODO: feels a bit awkward passing the menu's trigger state via props since we already are passing the menu's tree state as state.
  // Perhaps we should combine TreeState and the trigger state together? Alternatively I could add a 2nd kind of onClose handler to useMenu
  let {menuProps} = useMenu(completeProps, state, domRef);
  let {styleProps} = useStyleProps(completeProps);
  useSyncRef(contextProps, domRef);
  return (
    // TODO: always provide the first onAction from the original menu as a fallback? Or should the nearest onAction take precedent? Or should the user always provide an onAction for each submenu?
    <MenuStateContext.Provider value={{state, container: scopedRef, menu: domRef, topLevelonAction, topLevelMenuState}}>
      <FocusScope contain={state.expandedKeys.size > 0}>
        <ul
          {...menuProps}
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
        <div ref={scopedRef} />
      </FocusScope>
    </MenuStateContext.Provider>
  );
}

/**
 * Menus display a list of actions or options that a user can choose.
 */
// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Menu = React.forwardRef(Menu) as <T>(props: SpectrumMenuProps<T> & {ref?: DOMRef<HTMLUListElement>}) => ReactElement;
export {_Menu as Menu};
