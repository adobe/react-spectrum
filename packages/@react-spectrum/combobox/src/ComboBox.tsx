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

import {classNames, filterDOMProps, unwrapDOMRef, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
// import {ComboBoxProps} from '@react-types/$combobox';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {useComboBox} from '@react-aria/combobox';
import {useComboBoxState} from '@react-stately/combobox';
import {useProviderProps} from '@react-spectrum/provider';

import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {CollectionBase, DOMRef, InputBase, LabelPosition, SingleSelection, SpectrumLabelableProps, TextInputBase} from '@react-types/shared';
import {TextField, TextFieldBase} from '@react-spectrum/textfield';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {FieldButton} from '@react-spectrum/button';
import {FocusRing, FocusScope} from '@react-aria/focus';
import {Popover, Tray} from '@react-spectrum/overlays';
import {DismissButton, useOverlayPosition} from '@react-aria/overlays';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {Label} from '@react-spectrum/label';


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
  menuTrigger?: 'focus' | 'input' | 'manual'
}
interface SpectrumComboBox extends InputBase, TextInputBase, ComboBoxProps, SpectrumLabelableProps {
  isQuiet?: boolean
}

function ComboBox(props: SpectrumComboBox, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
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
    autoFocus
  } = props;

  let {styleProps} = useStyleProps(props);
  let popoverRef = useRef();
  let triggerRef = useRef();
  let listboxRef = useRef();
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
  let layout = useListBoxLayout(state);

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
        // width={isMobile ? '100%' : undefined} 
        />
      {/* <DismissButton onDismiss={() => state.setOpen(false)} /> */}
    </FocusScope>
  );

  // Will need to measure the width of textfield + button just like in picker
  // will also need to do a mobileCheck like in menutrigger/picker

  let {overlayProps, placement} = useOverlayPosition({
    targetRef: unwrapDOMRef(triggerRef),
    overlayRef: unwrapDOMRef(popoverRef),
    scrollRef: listboxRef,
    // placement: `${direction} ${align}` as Placement,
    placement: 'bottom start' as Placement,
    // shouldFlip: shouldFlip,
    shouldFlip: true, // FOR NOW HARDCODED
    isOpen: state.isOpen
  });

  let overlay = (
    <Popover
      isOpen={state.isOpen}
      // UNSAFE_style={style}
      UNSAFE_style={overlayProps.style}
      UNSAFE_className={classNames(styles, 'spectrum-Dropdown-popover', {'spectrum-Dropdown-popover--quiet': isQuiet})}
      ref={popoverRef}
      placement={placement}
      hideArrow
      shouldCloseOnBlur
      onClose={state.close}>
      {listbox}
    </Popover>
  );


  // Use TextFieldBase? Figure out where the class name should go
  // Maybe we don't even use textfield base, just a base input?
  // Need to wrap it all in a focus ring so that everything is highlighted when keyboard focused

  // Need to handle the label ourselves, can't use textfield label?
  // Figure out why textfield doesn't recieve aria-autocomplete 
  
  return (
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
            autoFocus={autoFocus} />
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

const _ComboBox = React.forwardRef(ComboBox);
export {_ComboBox as ComboBox};
