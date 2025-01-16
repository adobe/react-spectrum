/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DismissButton, useOverlay} from '@react-aria/overlays';
import {FocusScope} from '@react-aria/focus';
import {HiddenSelect, useSelect} from '@react-aria/select';
import React from 'react';
import {useButton} from '@react-aria/button';
import {useListBox, useOption} from '@react-aria/listbox';
import {useSelectState} from '@react-stately/select';

export function Select(props) {
  // Create state based on the incoming props
  let state = useSelectState(props);

  // Get props for child elements from useSelect
  let ref = React.useRef(null);
  let {
    labelProps,
    triggerProps,
    valueProps,
    menuProps
  } = useSelect(props, state, ref);

  // Get props for the button based on the trigger props from useSelect
  let {buttonProps} = useButton(triggerProps, ref);

  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <div {...labelProps}>{props.label}</div>
      <HiddenSelect
        state={state}
        triggerRef={ref}
        label={props.label}
        name={props.name} />
      <button
        {...buttonProps}
        ref={ref}
        style={{height: 30, fontSize: 14}}>
        <span {...valueProps}>
          {state.selectedItem
            ? state.selectedItem.rendered
            : 'Select an option'
          }
        </span>
        <span
          aria-hidden="true"
          style={{paddingLeft: 5}}>
          ▼
        </span>
      </button>
      {state.isOpen &&
        <Popover isOpen={state.isOpen} onClose={state.close}>
          <ListBox
            {...menuProps}
            state={state} />
        </Popover>
      }
    </div>
  );
}

function Popover(props) {
  let ref = React.useRef(undefined);
  let {
    popoverRef = ref,
    isOpen,
    onClose,
    children
  } = props;

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let {overlayProps} = useOverlay({
    isOpen,
    onClose,
    shouldCloseOnBlur: true,
    isDismissable: true
  }, popoverRef);

  // Add a hidden <DismissButton> component at the end of the popover
  // to allow screen reader users to dismiss the popup easily.
  return (
    <FocusScope restoreFocus>
      <div
        {...overlayProps}
        ref={popoverRef}
        style={{
          position: 'absolute',
          width: '100%',
          border: '1px solid gray',
          background: 'lightgray',
          marginTop: 4
        }}>
        {children}
        <DismissButton onDismiss={onClose} />
      </div>
    </FocusScope>
  );
}


function ListBox(props) {
  let ref = React.useRef(undefined);
  let {listBoxRef = ref, state} = props;
  let {listBoxProps} = useListBox(props, state, listBoxRef);

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        maxHeight: '150px',
        overflow: 'auto'
      }}>
      {[...state.collection].map(item => (
        <Option
          key={item.key}
          item={item}
          state={state} />
      ))}
    </ul>
  );
}

function Option({item, state}) {
  let ref = React.useRef(null);
  let {optionProps, isSelected, isFocused, isDisabled} = useOption({key: item.key}, state, ref);

  let backgroundColor;
  let color = 'black';

  if (isSelected) {
    backgroundColor = 'blueviolet';
    color = 'white';
  } else if (isFocused) {
    backgroundColor = 'gray';
  } else if (isDisabled) {
    backgroundColor = 'transparent';
    color = 'gray';
  }

  return (
    <li
      {...optionProps}
      ref={ref}
      style={{
        background: backgroundColor,
        color: color,
        padding: '2px 5px',
        outline: 'none',
        cursor: 'pointer'
      }}>
      {item.rendered}
    </li>
  );
}
