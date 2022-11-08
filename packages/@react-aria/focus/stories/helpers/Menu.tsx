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

import {Button} from './Button';
import {Popover} from './Popover';
import React from 'react';
import {useMenu, useMenuItem, useMenuSection, useMenuTrigger, useSeparator} from 'react-aria';
import {useMenuTriggerState, useTreeState} from 'react-stately';

function MenuItem({item, state, onAction, onClose}) {
  // Get props for the menu item element
  let ref = React.useRef();
  let {menuItemProps, isFocused, isSelected, isDisabled} = useMenuItem(
    {
      key: item.key,
      onAction,
      onClose
    },
    state,
    ref
  );

  return (
    <li
      {...menuItemProps}
      ref={ref}
      style={{
        background: isFocused ? 'gray' : 'transparent',
        // eslint-disable-next-line no-nested-ternary
        color: isDisabled ? 'gray' : (isFocused ? 'white' : 'black'),
        padding: '2px 5px',
        outline: 'none',
        cursor: 'default',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
      {item.rendered}
      {isSelected && <span aria-hidden="true">✅</span>}
    </li>
  );
}

function MenuSection({section, state, onAction, onClose}) {
  let {itemProps, headingProps, groupProps} = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let {separatorProps} = useSeparator({
    elementType: 'li'
  });

  // If the section is not the first, add a separator element.
  // The heading is rendered inside an <li> element, which contains
  // a <ul> with the child items.
  return (<>
    {section.key !== state.collection.getFirstKey() &&
      <li
        {...separatorProps}
        style={{
          borderTop: '1px solid gray',
          margin: '2px 5px'
        }} />
    }
    <li {...itemProps}>
      {section.rendered &&
        <span
          {...headingProps}
          style={{
            fontWeight: 'bold',
            fontSize: '1.1em',
            padding: '2px 5px'
          }}>
          {section.rendered}
        </span>
      }
      <ul
        {...groupProps}
        style={{
          padding: 0,
          listStyle: 'none'
        }}>
        {[...section.childNodes].map((node) => (
          <MenuItem
            key={node.key}
            item={node}
            state={state}
            onAction={onAction}
            onClose={onClose} />
          ))}
      </ul>
    </li>
  </>);
}

function Menu(props) {
  // Create menu state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = React.useRef();
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        width: 150
      }}>
      {[...state.collection].map((item) => (
        item.type === 'section'
          ? (
            <MenuSection
              key={item.key}
              section={item}
              state={state}
              onAction={props.onAction}
              onClose={props.onClose} />
          )
          : (
            <MenuItem
              key={item.key}
              item={item}
              state={state}
              onAction={props.onAction}
              onClose={props.onClose} />
          )
      ))}
    </ul>
  );
}

export function MenuButton(props) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the button and menu elements
  let ref = React.useRef();
  let {menuTriggerProps, menuProps} = useMenuTrigger({}, state, ref);

  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <Button
        {...menuTriggerProps}
        buttonRef={ref}
        style={{height: 30, fontSize: 14}} >
        {props.label}
        <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
      </Button>
      {state.isOpen &&
        (
          <Popover isOpen={state.isOpen} onClose={state.close}>
            <Menu
              {...props}
              {...menuProps} />
          </Popover>
        )}
    </div>
  );
}
