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
import {MenuContext, MenuStateContext} from './context';
import {MenuItem} from './MenuItem';
import {MenuSection} from './MenuSection';
import {mergeProps, useSyncRef} from '@react-aria/utils';
import React, {ReactElement, useContext, useRef} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenu} from '@react-aria/menu';
import {useTreeState} from '@react-stately/tree';
// TODO: get rid of these imports when I make SubMenu and SubMenuTrigger
import { ContextualHelpTrigger } from './ContextualHelpTrigger';
import { Content } from '@react-spectrum/view';
import { Dialog } from '@react-spectrum/dialog';
import { Heading } from '@react-spectrum/text';
import { ListBox } from '@react-spectrum/listbox';

function Menu<T extends object>(props: SpectrumMenuProps<T>, ref: DOMRef<HTMLUListElement>) {
  let {children} = props;
  let contextProps = useContext(MenuContext);
  let completeProps = {
    ...mergeProps(contextProps, props)
  };

  let domRef = useDOMRef(ref);
  let scopedRef = useRef(null);
  let state = useTreeState(completeProps);
  let {menuProps} = useMenu(completeProps, state, domRef);
  let {styleProps} = useStyleProps(completeProps);
  useSyncRef(contextProps, domRef);
  // console.log('state collection', [...state.collection], state.expandedKeys);
  return (
    <MenuStateContext.Provider value={{state, container: scopedRef, menu: domRef}}>
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
                  menuRenderer={typeof children === 'function' && children}
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
                // TODO if a MenuItem triggers a submenu, it doesn't support onAction right?
                onAction={completeProps.onAction} />
            );

            if (item.hasChildNodes) {
              // console.log('this is a sub menutrigger', item);
              // TODO: how to make it a trigger? Look at unavailable menu item
              // Will need to render something different from MenuItem? It will need to handle
              // different interactions (aka hover/keyboard for opening the submenu) and thus update expandedkeys
              // Perhaps make a generic version of ContextualHelpTrigger and then wrap the MenuItem below in it,
              // "content" becomes a Menu element that has the submenu's contents. How to get this content though?
              // Think I can just pass "item" to it? Also perhaps make SubMenu which is like Menu but doesn't need to setup its own state
              // Start by doing a dialog container or something and rendering it
              // useMenuItem already handles hover to open the submenu, just need to pass hasPopup
              // Things to write:
              // - SubMenu -> equivalent to Menu but doesn't need to setup its own state, just uses the parent Menu state?
              // Submenu wouldn't need the render function or anything, just needs the parent item's node and extract the childNodes + map over it and render MenuSections or MenuItems
              // - SubMenuTrigger -> equivalent to ContextualHelpTrigger but renders a SubMenu. Doesn't need to have getCollectionNode either


              // console.log('item', item, children === 'function' ? children : item.props.children,)
              console.log('item childNodes', [...item.childNodes])
              menuItem = (
                // This would be SubMenuTrigger?
                <ContextualHelpTrigger isSubMenu targetKey={item.key}>
                  {menuItem}
                  {/* SubMenu or Menu call would go here */}

                  <Dialog>
                    <Heading>blah</Heading>
                    <Content>
                      {/* {[...item.childNodes].map(node => node.rendered)} */}
                      <ListBox items={item.props.childItems}>
                        {typeof children === 'function' ? children : item.props.children}
                      </ListBox>
                    </Content>
                  </Dialog>

                  {/* TODO: below fails, try using SubMenu when that is created */}
                  {/* <Menu items={item.props.childItems}>
                    {typeof children === 'function' ? children : item.props.children}
                  </Menu> */}

                </ContextualHelpTrigger>
              )
            }

            // TODO: would be nice if ContextualHelp behaved the same way as submenu/shared code
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
