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

import {classNames, filterDOMProps, unwrapDOMRef, useDOMRef, useMediaQuery, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
// import {ComboBoxProps} from '@react-types/$combobox';
import React, {useLayoutEffect, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {useComboBox} from '@react-aria/combobox';
import {useComboBoxState} from '@react-stately/combobox';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {CollectionBase, DOMRef, DOMProps, InputBase, LabelPosition, SingleSelection, SpectrumLabelableProps, TextInputBase, StyleProps} from '@react-types/shared';
import {TextField, TextFieldBase} from '@react-spectrum/textfield';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {FieldButton} from '@react-spectrum/button';
import {FocusRing, FocusScope} from '@react-aria/focus';
import {Popover, Tray} from '@react-spectrum/overlays';
import {DismissButton, useOverlayPosition} from '@react-aria/overlays';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {Label} from '@react-spectrum/label';


// Should extend selectProps?
interface ComboBoxProps extends CollectionBase<T>, SingleSelection {
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  inputValue?: string,
  defaultInputValue?: string,
  onInputChange?: (value: string) => void,
  onFilter?: (value: string) => void,
  allowsCustomValue?: boolean,
  onCustomValue?: (value: string) => void,
  completionMode?: 'suggest' | 'complete',
  menuTrigger?: 'focus' | 'input' | 'manual',
  shouldFlip?: boolean
}

// Check extends
interface SpectrumComboBox extends InputBase, TextInputBase, ComboBoxProps, SpectrumLabelableProps, DOMProps, StyleProps {
  isQuiet?: boolean
}

function ComboBox(props: SpectrumComboBox, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  // Probably remove this?
  props = useSlotProps(props);

  let {
    isQuiet,
    isDisabled,
    isReadOnly,
    label,
    labelPosition = 'top',
    labelAlign,
    isRequired,
    necessityIndicator,
    validationState,
    // What is the default completion mode?
    completionMode = 'suggest',
    // What is the default menu trigger operation?
    menuTrigger = 'input',
    autoFocus,
    shouldFlip = true,
    width,
    placeholder
  } = props;

  let {styleProps} = useStyleProps(props);
  let popoverRef = useRef();
  let triggerRef = useRef();
  let listboxRef = useRef();
  // Possibly sync this ref with the one provided by the user?
  let inputRef = useRef();

  let state = useComboBoxState(props);
  console.log('state', state)
  // onBlur, onFocus, etc behavior for textfield and stuff should go into useComboBox
  let {triggerProps, inputProps, menuProps, labelProps} = useComboBox(
    {
      ...props,
      triggerRef: unwrapDOMRef(triggerRef),
      inputRef: unwrapDOMRef(inputRef)
    },
    state
  );
  let domRef = useDOMRef(ref);
  console.log('props from useCombobox', triggerProps, inputProps, menuProps, labelProps);




  // Below copied from picker, placeholder for now
  // Perhaps reorg this to be a common hook?
  let layout = useListBoxLayout(state);


  let {overlayProps, placement} = useOverlayPosition({
    targetRef: unwrapDOMRef(triggerRef),
    overlayRef: unwrapDOMRef(popoverRef),
    scrollRef: listboxRef,
    // Support direction and align props for combobox?
    // placement: `${direction} ${align}` as Placement,
    placement: 'bottom end' as Placement,
    shouldFlip: shouldFlip,
    isOpen: state.isOpen
  });

  
  let isMobile = useMediaQuery('(max-width: 700px)');
  // Figure out if we need the DismissButton (probably)
  let listbox = (
    <FocusScope restoreFocus>
      {/* <DismissButton onDismiss={() => state.setOpen(false)} /> */}
      <ListBoxBase
        ref={listboxRef}
        domProps={menuProps}
        disallowEmptySelection
        // Probably should have this be 'first'?
        autoFocus={state.focusStrategy}
        shouldSelectOnPressUp
        focusOnPointerEnter
        layout={layout}
        state={state}
        // Figure out what the below is for
        width={isMobile ? '100%' : undefined} 
        />
      {/* <DismissButton onDismiss={() => state.setOpen(false)} /> */}
    </FocusScope>
  );

  // Perhaps we could measure the wrapping div instead?
  // Measure the width of the inputfield and the button to inform the width of the menu (below).
  let [menuWidth, setMenuWidth] = useState(null);
  let {scale} = useProvider();

  useLayoutEffect(() => {
    if (!isMobile) {
      let buttonWidth = triggerRef.current.UNSAFE_getDOMNode().offsetWidth;
      let inputWidth = inputRef.current.UNSAFE_getDOMNode().offsetWidth;
      setMenuWidth(buttonWidth + inputWidth);
    }
  }, [scale, isMobile, triggerRef, state.selectedKey]);

  let overlay;
  if (isMobile) {
    overlay = (
      <Tray isOpen={state.isOpen} onClose={state.close} shouldCloseOnBlur>
        {listbox}
      </Tray>
    );
  } else {
    // Test the below for combobox, copied from Picker
    // let width = isQuiet ? null : comboboxWidth;

    let style = {
      ...overlayProps.style,
      // Should Combobox support a user defined menu width as well?
      // width: menuWidth ? dimensionValue(menuWidth) : width,
      width: menuWidth
      // See if Combobox needs the below as well
      // minWidth: isQuiet ? `calc(${buttonWidth}px + calc(2 * var(--spectrum-dropdown-quiet-offset)))` : buttonWidth
    };

    overlay = (
      <Popover
        isOpen={state.isOpen}
        UNSAFE_style={style}
        // UNSAFE_style={overlayProps.style}
        UNSAFE_className={classNames(styles, 'spectrum-Dropdown-popover', {'spectrum-Dropdown-popover--quiet': isQuiet})}
        ref={popoverRef}
        placement={placement}
        hideArrow
        shouldCloseOnBlur
        onClose={state.close}>
        {listbox}
      </Popover>
    );
  }

  // Look in the state.collection.size <= 300 logic in Picker and see if we need it for combobox



  // Logic for what should be rendered in the TextField
  // Think about where to put this and whether or not to 
  let selectedItem = state.selectedKey ? state.collection.getItem(state.selectedKey) : null;
  if (selectedItem) {
    let itemText = selectedItem.textValue || selectedItem.rendered;

    // TODO: logic on whether or not to take the selectedItem value over the current value (check if controlled or not)
    // TODO: all other logic

    
    // Throw error if controlled inputValue and controlled selectedKey don't match
    if (props.inputValue && props.selectedKey && (props.inputValue !== itemText)) {
      throw new Error('Mismatch between selected item and inputValue!')
    } 

    // Update textfield value if new item is selected
    if (itemText !== state.value) {
      state.setValue(itemText);
    }
  }

  // Use TextFieldBase? Figure out where the class name should go
  // Maybe we don't even use textfield base, just a base input?
  // Need to wrap it all in a focus ring so that everything is highlighted when keyboard focused

  // Need to handle the label ourselves, can't use textfield label?
  // Figure out why textfield doesn't recieve aria-autocomplete 
  
  return (
    // Ask if label is optional for combobox (and thus the below div wrapper + label is optional). Can do something like what picker does if so
    <div
      // Should dom props and dom ref go on this wrapper div or on the top
      {...filterDOMProps(props)}
      {...styleProps}
      // Maybe dom ref goes on the Textfield and we set inputRef above equal to it?
      ref={domRef}
      className={
        classNames(
          labelStyles,
          'spectrum-Field',
          {
            'spectrum-Field--positionTop': labelPosition === 'top',
            'spectrum-Field--positionSide': labelPosition === 'side'
          }
        )
      }>
      <Label
        {...labelProps}
        labelPosition={labelPosition}
        labelAlign={labelAlign}
        isRequired={isRequired}
        necessityIndicator={necessityIndicator}>
        {label}
      </Label>
      <FocusRing
        // Should this have within
        within
        isTextInput
        focusClass={classNames(styles, 'is-focused')}
        focusRingClass={classNames(styles, 'focus-ring')}
        autoFocus={autoFocus}>
        <div
          className={
            classNames(
              styles,
              'spectrum-InputGroup',
              {
                'spectrum-InputGroup--quiet': isQuiet,
                'is-disabled': isDisabled,
                'is-invalid': validationState === 'invalid'
              },
              styleProps.className
            )
          }>
          <TextFieldBase
            {...inputProps}
            ref={inputRef}
            inputClassName={
              classNames(
                styles,
                'spectrum-InputGroup-field',
                classNames(labelStyles, 'spectrum-Field-field')
              )
            }
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isQuiet={isQuiet}
            value={state.value}
            // check onInputChange, this probably needs to be onInputChange?
            onChange={state.setValue}
            validationState={validationState}
            autoFocus={autoFocus}
            width={width}
            placeholder={placeholder} />
          <FieldButton
            {...triggerProps}
            ref={triggerRef}
            UNSAFE_className={
              classNames(
                styles,
                'spectrum-FieldButton'
              )
            }
            // Disable if readOnly?
            isDisabled={isDisabled || isReadOnly}
            isQuiet={isQuiet}
            validationState={validationState}>
            <ChevronDownMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-chevron')} />
          </FieldButton>
          {overlay}
        </div>
      </FocusRing>
    </div>
  );
}

// Probably need to cast this
const _ComboBox = React.forwardRef(ComboBox);
export {_ComboBox as ComboBox};
