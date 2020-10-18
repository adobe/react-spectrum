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

import {useComboBox} from '@react-aria/combobox';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames, unwrapDOMRef} from '@react-spectrum/utils';
import {ComboBoxState, useComboBoxState} from '@react-stately/combobox';
import comboboxStyles from './combobox.css';
import {DismissButton} from '@react-aria/overlays';
import {DOMRefValue, FocusableRefValue, ValidationState, PressEvents} from '@react-types/shared';
import {FocusRing, FocusScope} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {mergeProps, useId} from '@react-aria/utils';
import {Tray} from '@react-spectrum/overlays';
import {useHover} from '@react-aria/interactions';
import React, {HTMLAttributes, ReactNode, RefObject, useRef} from 'react';
import {SpectrumComboBoxProps} from '@react-types/combobox';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useFilter} from '@react-aria/i18n';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useOverlayTrigger} from '@react-aria/overlays';

import {useDOMRef} from '@react-spectrum/utils';
import {Field} from '@react-spectrum/label';
import {useLabel} from '@react-aria/label';
import {useDialog} from '@react-aria/dialog';
import {focusSafely} from '@react-aria/focus';
import searchStyles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {ClearButton} from '@react-spectrum/button';
import {PressResponder} from '@react-aria/interactions';

export const MobileComboBox = React.forwardRef(function MobileComboBox<T extends object>(props: SpectrumComboBoxProps<T>, ref: RefObject<DOMRefValue<HTMLDivElement>>) {
  props = useProviderProps(props);

  let {
    isQuiet,
    isDisabled,
    validationState,
  } = props;

  let {contains} = useFilter({sensitivity: 'base'});
  let state = useComboBoxState({
    ...props,
    defaultFilter: contains,
    allowsEmptyCollection: true,
    shouldCloseOnBlur: false
  });

  ref = ref || useRef();
  let buttonRef = unwrapDOMRef(ref);
  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'listbox'}, state, buttonRef);

  let valueId = useId();
  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  return (
    <>
      <Field {...props} labelProps={labelProps} elementType="span" ref={ref}>
        <ComboBoxButton
          {...mergeProps(triggerProps, fieldProps)}
          isQuiet={isQuiet}
          isDisabled={isDisabled}
          validationState={validationState}
          onPress={() => state.open()}
          aria-labelledby={[
            fieldProps['aria-labelledby'],
            fieldProps['aria-label'] && !fieldProps['aria-labelledby'] ? fieldProps.id : null,
            valueId
          ].filter(Boolean).join(' ')}>
          <span id={valueId}>
            {state.inputValue}
          </span>
        </ComboBoxButton>
      </Field>
      <Tray isOpen={state.isOpen} onClose={state.commit} isFixedHeight {...overlayProps}>
        <ComboBoxTray
          {...props}
          overlayProps={overlayProps}
          state={state} />
      </Tray>
    </>
  );
});

interface ComboBoxButtonProps extends PressEvents {
  isQuiet?: boolean,
  isDisabled?: boolean,
  validationState?: ValidationState,
  children?: ReactNode,
  style?: React.CSSProperties,
  className?: string
}

const ComboBoxButton = React.forwardRef(function ComboBoxButton(props: ComboBoxButtonProps, ref: RefObject<DOMRefValue<HTMLDivElement>>) {
  let {
    isQuiet,
    isDisabled,
    validationState,
    children,
    style,
    className
  } = props;

  let domRef = useDOMRef(ref);
  let {hoverProps, isHovered} = useHover({});

  let {buttonProps, isPressed} = useButton({
    ...props,
    elementType: 'div'
  }, domRef);

  return (
    <FocusRing
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(hoverProps, buttonProps)}
        aria-haspopup="dialog"
        ref={domRef}
        style={{...style, outline: 'none'}}
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
            className
          )
        }>
        <div
          className={
            classNames(
              textfieldStyles,
              'spectrum-Textfield',
              {
                'is-invalid': validationState === 'invalid',
                'is-valid': validationState === 'valid',
                'spectrum-Textfield--quiet': isQuiet,
              }
            )
          }>
            <div
              className={
                classNames(
                  textfieldStyles,
                  'spectrum-Textfield-input',
                  {
                    'is-hovered': isHovered
                  },
                  classNames(
                    styles,
                    'spectrum-InputGroup-field',
                    classNames(labelStyles, 'spectrum-Field-field')
                  )
                )
              }>
              {children}
            </div>
          </div>
          <div
            style={{WebkitAppearance: 'none'}}
            className={
              classNames(
                buttonStyles,
                'spectrum-FieldButton',
                {
                  'spectrum-FieldButton--quiet': isQuiet,
                  'is-active': isPressed,
                  'is-disabled': isDisabled,
                  'is-invalid': validationState === 'invalid',
                  'is-hovered': isHovered
                },
                classNames(
                  styles,
                  'spectrum-FieldButton'
                )
              )
            }>
            <ChevronDownMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-chevron')} />
          </div>
        </div>
    </FocusRing>
  );
});

interface ComboBoxTrayProps extends SpectrumComboBoxProps<unknown> {
  state: ComboBoxState<unknown>,
  overlayProps: HTMLAttributes<HTMLElement>
}

function ComboBoxTray(props: ComboBoxTrayProps) {
  let {
    completionMode = 'suggest',
    menuTrigger = 'input',
    state,
    isDisabled,
    validationState,
    label,
    overlayProps
  } = props;

  let inputRef = useRef<HTMLInputElement>();
  let triggerRef = useRef<FocusableRefValue<HTMLElement>>();
  let popoverRef = useRef<HTMLDivElement>();
  let layout = useListBoxLayout(state);
  let formatMessage = useMessageFormatter(intlMessages);

  let {inputProps, listBoxProps, labelProps} = useComboBox(
    {
      ...props,
      completionMode,
      layout,
      triggerRef: unwrapDOMRef(triggerRef),
      popoverRef: popoverRef,
      inputRef,
      menuTrigger
    },
    state
  );

  React.useEffect(() => {
    focusSafely(inputRef.current)
  }, []);

  let {dialogProps} = useDialog({
    'aria-labelledby': useId(labelProps.id)
  }, popoverRef);

  // Override the role of the input to "searchbox" instead of "combobox".
  // Since the listbox is always visible, the combobox role doesn't really give us anything.
  // VoiceOver on iOS reads "double tap to collapse" when focused on the input rather than
  // "double tap to edit text", as with a textbox or searchbox. We'd like double tapping to
  // open the virtual keyboard rather than closing the tray.
  inputProps.role = 'searchbox';
  inputProps['aria-haspopup'] = 'listbox'
  delete inputProps.onTouchEnd;

  let clearButton = (
    <PressResponder preventFocusOnPress>
      <ClearButton
        aria-label={formatMessage('clear')}
        excludeFromTabOrder
        onPress={() => state.setInputValue('')}
        UNSAFE_className={
        classNames(
          searchStyles,
          'spectrum-ClearButton'
        )
      }
      isDisabled={isDisabled} />
    </PressResponder>
  );

  let listboxRef = useRef();

  return (
    <div {...mergeProps(overlayProps, dialogProps)} ref={popoverRef} style={{display: 'flex', flexDirection: 'column'}}>
      <FocusScope restoreFocus>
        <DismissButton onDismiss={() => state.commit()} />
        <TextFieldBase
          label={label}
          labelProps={labelProps}
          inputProps={inputProps}
          inputRef={inputRef}
          isDisabled={isDisabled}
          validationState={validationState}
          marginTop={label ? 5 : 15}
          marginX={15}
          flexShrink={0}
          UNSAFE_style={{width: 'initial'}}
          wrapperChildren={(state.inputValue !== '' && !props.isReadOnly) && clearButton}
          UNSAFE_className={classNames(searchStyles, 'spectrum-Search')} />
        <ListBoxBase
          domProps={listBoxProps}
          disallowEmptySelection
          shouldSelectOnPressUp
          focusOnPointerEnter
          layout={layout}
          state={state}
          width="100%"
          // Set max height: inherit so Tray scrolling works
          UNSAFE_style={{maxHeight: 'inherit'}}
          shouldUseVirtualFocus
          renderEmptyState={() => (
            <span className={classNames(comboboxStyles, 'no-results')}>
              {formatMessage('noResults')}
            </span>
          )}
          ref={listboxRef}
          onScroll={() => {
            if (!listboxRef.current || !inputRef.current || document.activeElement !== inputRef.current) {
              return;
            }

            inputRef.current.blur();
          }}
          flex={1} />
        <DismissButton onDismiss={() => state.commit()} />
      </FocusScope>
    </div>
  );
}
