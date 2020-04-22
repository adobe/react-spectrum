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

import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames, unwrapDOMRef, useDOMRef, useMediaQuery, useStyleProps} from '@react-spectrum/utils';
import {
  CollectionBase,
  DOMProps,
  DOMRef, DOMRefValue,
  FocusableRefValue,
  InputBase,
  SingleSelection,
  SpectrumLabelableProps,
  StyleProps,
  TextInputBase
} from '@react-types/shared';
import {DismissButton, useOverlayPosition} from '@react-aria/overlays';
import {FieldButton} from '@react-spectrum/button';
import {FocusRing, FocusScope} from '@react-aria/focus';
import {Label} from '@react-spectrum/label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {Placement} from '@react-types/overlays';
import {Popover, Tray} from '@react-spectrum/overlays';
import React, {useLayoutEffect, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useComboBox} from '@react-aria/combobox';
import {useComboBoxState} from '@react-stately/combobox';
import {useProvider, useProviderProps} from '@react-spectrum/provider';


interface ComboBoxProps<T> extends CollectionBase<T>, SingleSelection {
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

// TODO: Check extends
interface SpectrumComboBox<T> extends InputBase, TextInputBase, ComboBoxProps<T>, SpectrumLabelableProps, DOMProps, StyleProps {
  isQuiet?: boolean
}

function ComboBox<T>(props: SpectrumComboBox<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);

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
    completionMode = 'suggest',
    menuTrigger = 'input',
    autoFocus,
    shouldFlip = true,
    width,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(props);
  let popoverRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<FocusableRefValue<HTMLElement>>();
  let listboxRef = useRef();
  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>();
  let domRef = useDOMRef(ref);

  let state = useComboBoxState(props);
  let layout = useListBoxLayout(state);
  let {triggerProps, inputProps, menuProps, labelProps} = useComboBox(
    {
      ...props,
      menuTrigger,
      completionMode,
      layout,
      triggerRef: unwrapDOMRef(triggerRef),
      inputRef: inputRef,
      popoverRef: unwrapDOMRef(popoverRef)
    },
    state
  );

  let {overlayProps, placement} = useOverlayPosition({
    targetRef: unwrapDOMRef(triggerRef),
    overlayRef: unwrapDOMRef(popoverRef),
    scrollRef: listboxRef,
    placement: 'bottom end' as Placement,
    shouldFlip: shouldFlip,
    isOpen: state.isOpen
  });

  let isMobile = useMediaQuery('(max-width: 700px)');

  let listbox = (
    <FocusScope>
      <DismissButton onDismiss={() => state.setOpen(false)} />
      <ListBoxBase
        ref={listboxRef}
        domProps={menuProps}
        disallowEmptySelection
        // TODO: adjust this from 'first'? Depends on whether or not we want to ever focus something other than the first item if no items are selected
        autoFocus={props.allowsCustomValue ? false : (state.focusStrategy || 'first')}
        shouldSelectOnPressUp
        focusOnPointerEnter
        layout={layout}
        state={state}
        width={isMobile ? '100%' : undefined}
        shouldUseVirtualFocus />
      <DismissButton onDismiss={() => state.setOpen(false)} />
    </FocusScope>
  );

  // Measure the width of the inputfield and the button to inform the width of the menu (below).
  let [menuWidth, setMenuWidth] = useState(null);
  let {scale} = useProvider();

  useLayoutEffect(() => {
    if (!isMobile) {
      let buttonWidth = triggerRef.current.UNSAFE_getDOMNode().offsetWidth;
      let inputWidth = inputRef.current.offsetWidth;
      setMenuWidth(buttonWidth + inputWidth);
    }
  }, [scale, isMobile, triggerRef, inputRef, state.selectedKey]);

  let overlay;
  if (isMobile) {
    overlay = (
      <Tray isOpen={state.isOpen} onClose={state.close} shouldCloseOnBlur>
        {listbox}
      </Tray>
    );
  } else {
    let style = {
      ...overlayProps.style,
      width: menuWidth
    };

    overlay = (
      <Popover
        isOpen={state.isOpen}
        UNSAFE_style={style}
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

  let textField = (
    <FocusRing
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
        }
        style={{width: '100%'}}>
        <TextFieldBase
          // Perhaps should filterDOMProps(DOMEventPropNames)?
          // Think about whether or not we want to do send all otherProps to Textfield or be more discerning?
          {...otherProps}
          // check this passing of labelProps since we handle label ourselves for combobox
          labelProps={labelProps}
          inputProps={inputProps}
          inputRef={inputRef}
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
          validationState={validationState}
          width={width} />
        <FieldButton
          {...triggerProps}
          ref={triggerRef}
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-FieldButton'
            )
          }
          // TODO: Disable if readOnly? Check designs
          isDisabled={isDisabled || isReadOnly}
          isQuiet={isQuiet}
          validationState={validationState}>
          <ChevronDownMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-chevron')} />
        </FieldButton>
        {overlay}
      </div>
    </FocusRing>
  );

  if (props.label) {
    let labelWrapperClass = classNames(
      labelStyles,
      'spectrum-Field',
      {
        'spectrum-Field--positionTop': labelPosition === 'top',
        'spectrum-Field--positionSide': labelPosition === 'side'
      },
      styleProps.className
    );

    return (
      <div
        {...styleProps}
        ref={domRef}
        className={labelWrapperClass}>
        <Label
          {...labelProps}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          isRequired={isRequired}
          necessityIndicator={necessityIndicator}>
          {label}
        </Label>
        {textField}
      </div>
    );
  }

  return textField;
}

// TODO: Probably need to cast this
const _ComboBox = React.forwardRef(ComboBox);
export {_ComboBox as ComboBox};

// function unwrapInputRef(ref: RefObject<TextFieldRef>) {
//   return {
//     get current() {
//       return ref.current && ref.current.getInputElement();
//     }
//   };
// }
