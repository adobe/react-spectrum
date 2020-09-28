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

import {AriaComboBoxProps, useComboBox} from '@react-aria/combobox';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames, unwrapDOMRef, useIsMobileDevice, useStyleProps} from '@react-spectrum/utils';
import {ComboBoxState, useComboBoxState} from '@react-stately/combobox';
import {DismissButton, useOverlayPosition} from '@react-aria/overlays';
import {DOMRefValue, FocusableRefValue} from '@react-types/shared';
import {FieldButton} from '@react-spectrum/button';
import {FocusRing, FocusScope} from '@react-aria/focus';
import {Label} from '@react-spectrum/label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {mergeProps, useId, useLayoutEffect} from '@react-aria/utils';
import {Placement} from '@react-types/overlays';
import {Popover, Tray} from '@react-spectrum/overlays';
import {PressResponder, useHover} from '@react-aria/interactions';
import React, {ReactElement, RefObject, useRef, useState} from 'react';
import {SpectrumComboBoxProps} from '@react-types/combobox';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {TextFieldRef} from '@react-types/textfield';
import {useCollator} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

function ComboBox<T extends object>(props: SpectrumComboBoxProps<T>, ref: RefObject<TextFieldRef>) {
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
    direction = 'bottom'
  } = props;

  let isMobile = useIsMobileDevice();
  let {hoverProps, isHovered} = useHover(props);
  let {styleProps} = useStyleProps(props);
  let popoverRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<FocusableRefValue<HTMLElement>>();
  let listboxRef = useRef();
  let trayInputRef = useRef();
  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>();
  let collator = useCollator({sensitivity: 'base'});
  let state = useComboBoxState({...props, collator, isMobile});
  let layout = useListBoxLayout(state);

  let {triggerProps, inputProps, listBoxProps, labelProps} = useComboBox(
    {
      ...props,
      completionMode,
      layout,
      triggerRef: unwrapDOMRef(triggerRef),
      popoverRef: unwrapDOMRef(popoverRef),
      inputRef: inputRef,
      menuTrigger,
      isMobile
    },
    state
  );

  let {overlayProps, placement} = useOverlayPosition({
    targetRef: unwrapDOMRef(triggerRef),
    overlayRef: unwrapDOMRef(popoverRef),
    scrollRef: listboxRef,
    placement: `${direction} end` as Placement,
    shouldFlip: shouldFlip,
    isOpen: state.isOpen && !isMobile,
    onClose: state.close
  });

  let comboBoxAutoFocus;
  // Focus first/last item on menu open if focusStategy is set (done by up/down arrows)
  if (state.focusStrategy) {
    comboBoxAutoFocus = state.focusStrategy;
  }

  let trayId = useId();
  let listbox = (
    <FocusScope>
      <DismissButton onDismiss={() => state.close()} />
      {isMobile &&
        <ComboBoxTrayInput
          {...props}
          // generate a new id so we don't accidentially reuse a user generated id twice
          id={trayId}
          menuId={listBoxProps.id}
          layout={layout}
          popoverRef={unwrapDOMRef(popoverRef)}
          inputRef={trayInputRef}
          triggerRef={unwrapDOMRef(triggerRef)}
          isMobile={isMobile}
          state={state}
          autoFocus />
      }
      <ListBoxBase
        ref={listboxRef}
        domProps={listBoxProps}
        disallowEmptySelection
        autoFocus={comboBoxAutoFocus}
        shouldSelectOnPressUp
        focusOnPointerEnter
        layout={layout}
        state={state}
        width={isMobile ? '100%' : undefined}
        // Set max height: inherit so Tray scrolling works
        UNSAFE_style={{maxHeight: 'inherit'}}
        shouldUseVirtualFocus
        isMobile={isMobile} />
      <DismissButton onDismiss={() => state.close()} />
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
  }, [scale, isMobile, triggerRef, inputRef]);

  let overlay;
  if (isMobile) {
    overlay = (
      <Tray isOpen={state.isOpen} onClose={state.close} lockHeightToMax ref={popoverRef}>
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

  // If there is a label defined, the textfield width should be determined by the label container
  // otherwise it should recieve the style props
  let textFieldStyles = props.label ? {style: {width: '100%'}} : styleProps;

  let textField = (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}
      autoFocus={autoFocus}>
      <div
        {...textFieldStyles}
        {...hoverProps}
        className={
          classNames(
            styles,
            'spectrum-InputGroup',
            {
              'spectrum-InputGroup--quiet': isQuiet,
              'is-disabled': isDisabled,
              'is-invalid': validationState === 'invalid',
              'is-hovered': isHovered
            },
            !props.label && styleProps.className
          )
        }>
        <TextFieldBase
          labelProps={labelProps}
          inputProps={inputProps}
          inputRef={inputRef}
          ref={ref}
          inputClassName={
            classNames(
              styles,
              'spectrum-InputGroup-field',
              classNames(labelStyles, 'spectrum-Field-field')
            )
          }
          isDisabled={isDisabled}
          isQuiet={isQuiet}
          validationState={validationState}
          flex={1} />
        <PressResponder preventFocusOnPress>
          <FieldButton
            {...triggerProps}
            ref={triggerRef}
            UNSAFE_className={
              classNames(
                styles,
                'spectrum-FieldButton'
              )
            }
            isDisabled={isDisabled || isReadOnly}
            isQuiet={isQuiet}
            validationState={validationState}>
            <ChevronDownMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-chevron')} />
          </FieldButton>
        </PressResponder>
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

interface ComboBoxTrayInputProps<T> extends SpectrumComboBoxProps<T>, AriaComboBoxProps<T> {
  state: ComboBoxState<T>
}

function ComboBoxTrayInput<T>(props: ComboBoxTrayInputProps<T>) {
  let {
    validationState,
    isDisabled,
    isReadOnly,
    isRequired,
    necessityIndicator,
    state,
    inputRef,
    label
  } = props;

  // Create a ref tracker that tracks if the tray input field was blurred. If tray input field was blurred,
  // we'll want to stop the first virtual click from closing the tray in the usePress below so the user can properly
  // restore focus and type in the textfield
  let deferClose = useRef(false);
  let {labelProps, inputProps} = useComboBox({
    ...props,
    onBlur: undefined,
    onFocus: undefined
  }, state);

  // If click happens on direct center of tray input, might be virtual click from VoiceOver so close the tray
  let onClick = (e) => {
    let rect = (e.target as HTMLElement).getBoundingClientRect();

    let middleOfRect = {
      x: Math.round(rect.left + .5 * rect.width),
      y: Math.round(rect.top + .5 * rect.height)
    };

    if (e.clientX === middleOfRect.x && e.clientY === middleOfRect.y) {
      if (!deferClose.current) {
        state.close();
      } else {
        deferClose.current = false;
      }
    }
  };

  // Add a separate onBlur to attach to the tray input because useComboBox doesn't call props.onBlur if e.relatedTarget is null (e.g. closing virtual keyboard when tray is open)
  let onBlur = () => deferClose.current = true;

  return (
    <TextFieldBase
      label={label}
      // Prevent default on tray input label so it doesn't close tray on click
      labelProps={{...labelProps, onClick: (e) => e.preventDefault()}}
      inputProps={mergeProps(inputProps, {onClick, onBlur})}
      inputRef={inputRef}
      marginTop={label ? 5 : 15}
      marginX={15}
      width={'initial'}
      validationState={validationState}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      necessityIndicator={necessityIndicator} />
  );
}

const _ComboBox = React.forwardRef(ComboBox) as <T>(props: SpectrumComboBoxProps<T> & {ref?: RefObject<TextFieldRef>}) => ReactElement;
export {_ComboBox as ComboBox};
