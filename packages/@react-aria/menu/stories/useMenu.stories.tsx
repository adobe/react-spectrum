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

import {action} from '@storybook/addon-actions';
import {DismissButton, useOverlay} from '@react-aria/overlays';
import {FocusScope} from '@react-aria/focus';
import {Item} from '@react-stately/collections';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useButton} from '@react-aria/button';
import {useFocus, useInteractOutside} from '@react-aria/interactions';
import {useMenu, useMenuItem, useMenuTrigger} from '@react-aria/menu';
import {useMenuTriggerState} from '@react-stately/menu';
import {useTreeState} from '@react-stately/tree';

export default {
  title: 'useMenu'
};

export const DoubleMenuFiresOnInteractOutside = {
  render: () => (
    <div>
      <div>
        This should just be there to show that onInteractOutside fires when clicking on another
        trigger.
      </div>
      <MenuButton label="Actions">
        <Item key="copy">Copy</Item>
        <Item key="cut">Cut</Item>
        <Item key="paste">Paste</Item>
      </MenuButton>
      <MenuButton label="Actions2">
        <Item key="copy">Copy</Item>
        <Item key="cut">Cut</Item>
        <Item key="paste">Paste</Item>
      </MenuButton>
      <input aria-label="input after" />
    </div>
  ),
  name: 'double menu fires onInteractOutside'
};

function MenuButton(props) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the menu trigger and menu elements
  let ref = React.useRef(null);
  let {menuTriggerProps, menuProps} = useMenuTrigger({}, state, ref);

  // Get props for the button based on the trigger props from useMenuTrigger
  let {buttonProps} = useButton(menuTriggerProps, ref);

  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <button {...buttonProps} ref={ref} style={{height: 30, fontSize: 14}}>
        {props.label}
        <span aria-hidden="true" style={{paddingLeft: 5}}>
          ▼
        </span>
      </button>
      {state.isOpen && (
        <MenuPopup
          {...props}
          domProps={menuProps}
          autoFocus={state.focusStrategy}
          onClose={() => state.close()} />
      )}
    </div>
  );
}

function MenuPopup(props) {
  // Create menu state based on the incoming props
  let state = useTreeState({...props, selectionMode: 'none'});

  // Get props for the menu element
  let ref = React.useRef(null);
  let {menuProps} = useMenu(props, state, ref);

  // Handle events that should cause the menu to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let overlayRef = React.useRef(null);
  // before useOverlay so this action will get called
  useInteractOutside({ref: overlayRef, onInteractOutside: action('onInteractOutside')});
  let {overlayProps} = useOverlay(
    {
      onClose: props.onClose,
      shouldCloseOnBlur: true,
      isOpen: true,
      isDismissable: true
    },
    overlayRef
  );

  // Wrap in <FocusScope> so that focus is restored back to the
  // trigger when the menu is closed. In addition, add hidden
  // <DismissButton> components at the start and end of the list
  // to allow screen reader users to dismiss the popup easily.
  return (
    <FocusScope restoreFocus>
      <div {...overlayProps} ref={overlayRef}>
        <DismissButton onDismiss={props.onClose} />
        <ul
          {...mergeProps(menuProps, props.domProps)}
          ref={ref}
          style={{
            position: 'absolute',
            width: '100%',
            margin: '4px 0 0 0',
            padding: 0,
            listStyle: 'none',
            border: '1px solid gray',
            background: 'lightgray'
          }}>
          {[...state.collection].map((item) => (
            <MenuItem
              key={item.key}
              item={item}
              state={state}
              onClose={props.onClose}
              onAction={props.onAction} />
          ))}
        </ul>
        <DismissButton onDismiss={props.onClose} />
      </div>
    </FocusScope>
  );
}

function MenuItem({item, state, onAction, onClose}) {
  // Get props for the menu item element
  let ref = React.useRef(null);
  let {menuItemProps} = useMenuItem(
    {
      key: item.key,
      isDisabled: item.isDisabled,
      onAction,
      onClose
    },
    state,
    ref
  );

  // Handle focus events so we can apply highlighted
  // style to the focused menu item
  let [isFocused, setFocused] = React.useState(false);
  let {focusProps} = useFocus({onFocusChange: setFocused});

  return (
    <li
      {...mergeProps(menuItemProps, focusProps)}
      ref={ref}
      style={{
        background: isFocused ? 'gray' : 'transparent',
        color: isFocused ? 'white' : 'black',
        padding: '2px 5px',
        outline: 'none',
        cursor: 'pointer'
      }}>
      {item.rendered}
    </li>
  );
}
