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

import {AriaButtonProps} from '@react-types/button';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {
  classNames,
  useFocusableRef,
  useIsMobileDevice,
  useResizeObserver,
  useUnwrapDOMRef
} from '@react-spectrum/utils';
import {DismissButton, useOverlayPosition} from '@react-aria/overlays';
import {DOMRefValue, FocusableRef, FocusableRefValue} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {FieldButton} from '@react-spectrum/button';
import {FocusRing} from '@react-aria/focus';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {MobileComboBox} from './MobileComboBox';
import {Placement} from '@react-types/overlays';
import {Popover} from '@react-spectrum/overlays';
import {PressResponder, useHover} from '@react-aria/interactions';
import React, {
  InputHTMLAttributes,
  ReactElement,
  RefObject,
  useCallback,
  useRef,
  useState
} from 'react';
import {SpectrumComboBoxProps} from '@react-types/combobox';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useComboBox} from '@react-aria/combobox';
import {useComboBoxState} from '@react-stately/combobox';
import {useFilter} from '@react-aria/i18n';
import {useLayoutEffect} from '@react-aria/utils';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

function ComboBox<T extends object>(props: SpectrumComboBoxProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);

  let isMobile = useIsMobileDevice();
  if (isMobile) {
    return <MobileComboBox {...props} ref={ref} />;
  } else {
    return <ComboBoxBase {...props} ref={ref} />;
  }
}

const ComboBoxBase = React.forwardRef(function ComboBoxBase<T extends object>(props: SpectrumComboBoxProps<T>, ref: FocusableRef<HTMLElement>) {
  let {
    menuTrigger = 'input',
    shouldFlip = true,
    direction = 'bottom',
    UNSAFE_className
  } = props;

  let popoverRef = useRef<DOMRefValue<HTMLDivElement>>();
  let unwrappedPopoverRef = useUnwrapDOMRef(popoverRef);
  let buttonRef = useRef<FocusableRefValue<HTMLElement>>();
  let unwrappedButtonRef = useUnwrapDOMRef(buttonRef);
  let listBoxRef = useRef();
  let inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>();
  let domRef = useFocusableRef(ref, inputRef);

  let {contains} = useFilter({sensitivity: 'base'});
  let state = useComboBoxState({...props, defaultFilter: contains});
  let layout = useListBoxLayout(state);

  let {buttonProps, inputProps, listBoxProps, labelProps} = useComboBox(
    {
      ...props,
      keyboardDelegate: layout,
      buttonRef: unwrappedButtonRef,
      popoverRef: unwrappedPopoverRef,
      listBoxRef,
      inputRef: inputRef,
      menuTrigger
    },
    state
  );

  let {overlayProps, placement} = useOverlayPosition({
    targetRef: unwrappedButtonRef,
    overlayRef: unwrappedPopoverRef,
    scrollRef: listBoxRef,
    placement: `${direction} end` as Placement,
    shouldFlip: shouldFlip,
    isOpen: state.isOpen,
    onClose: state.close
  });

  // Measure the width of the inputfield and the button to inform the width of the menu (below).
  let [menuWidth, setMenuWidth] = useState(null);
  let {scale} = useProvider();

  let onResize = useCallback(() => {
    let buttonWidth = unwrappedButtonRef.current.offsetWidth;
    let inputWidth = inputRef.current.offsetWidth;
    setMenuWidth(buttonWidth + inputWidth);
  }, [unwrappedButtonRef, inputRef, setMenuWidth]);

  useResizeObserver({
    ref: domRef,
    onResize: onResize
  });

  useLayoutEffect(onResize, [scale, onResize]);

  let style = {
    ...overlayProps.style,
    width: menuWidth
  };

  let labelClassName;
  let inputClassName;
  if (props.label && props.isQuiet) {
    labelClassName = classNames(
      labelStyles,
      'spectrum-FieldLabel--quiet'
    );

    inputClassName = classNames(
      labelStyles,
      'spectrum-Field-fieldInput--quiet'
    );
  }

  return (
    <>
      <Field {...props} labelProps={labelProps} labelClassName={labelClassName} ref={domRef}>
        <ComboBoxInput
          {...props}
          UNSAFE_className={
            classNames(
              styles,
              {
                'spectrum-InputGroup--menuOpen': state.isOpen
              },
              UNSAFE_className
            )
          }
          inputClassName={inputClassName}
          inputProps={inputProps}
          inputRef={inputRef}
          triggerProps={buttonProps}
          triggerRef={buttonRef} />
      </Field>
      <Popover
        isOpen={state.isOpen}
        UNSAFE_style={style}
        ref={popoverRef}
        placement={placement}
        hideArrow
        isNonModal>
        <ListBoxBase
          ref={listBoxRef}
          domProps={listBoxProps}
          disallowEmptySelection
          autoFocus={state.focusStrategy}
          shouldSelectOnPressUp
          focusOnPointerEnter
          layout={layout}
          state={state}
          // Set max height: inherit so Tray scrolling works
          UNSAFE_style={{maxHeight: 'inherit'}}
          shouldUseVirtualFocus />
        <DismissButton onDismiss={() => state.close()} />
      </Popover>
    </>
  );
});

interface ComboBoxInputProps extends SpectrumComboBoxProps<unknown> {
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  triggerProps: AriaButtonProps,
  triggerRef: RefObject<FocusableRefValue<HTMLElement>>,
  inputClassName?: string,
  style?: React.CSSProperties
}

const ComboBoxInput = React.forwardRef(function ComboBoxInput(props: ComboBoxInputProps, ref: RefObject<HTMLElement>) {
  let {
    isQuiet,
    isDisabled,
    isReadOnly,
    validationState,
    inputProps,
    inputRef,
    triggerProps,
    triggerRef,
    autoFocus,
    style,
    UNSAFE_className,
    inputClassName
  } = props;
  let {hoverProps, isHovered} = useHover({});

  return (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}
      autoFocus={autoFocus}>
      <div
        {...hoverProps}
        ref={ref as RefObject<HTMLDivElement>}
        style={style}
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
            UNSAFE_className
          )
        }>
        <TextFieldBase
          inputProps={inputProps}
          inputRef={inputRef}
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-InputGroup-field'
            )
          }
          inputClassName={
            classNames(
              styles,
              'spectrum-InputGroup-input',
              inputClassName
            )
          }
          isDisabled={isDisabled}
          isQuiet={isQuiet}
          validationState={validationState} />
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
      </div>
    </FocusRing>
  );
});

/**
 * ComboBoxes combine a text entry with a picker menu, allowing users to filter longer lists to only the selections matching a query.
 */
const _ComboBox = React.forwardRef(ComboBox) as <T>(props: SpectrumComboBoxProps<T> & {ref?: FocusableRef<HTMLElement>}) => ReactElement;
export {_ComboBox as ComboBox};
