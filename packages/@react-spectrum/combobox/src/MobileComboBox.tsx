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

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {AriaButtonProps} from '@react-types/button';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames, unwrapDOMRef} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import {ComboBoxState, useComboBoxState} from '@react-stately/combobox';
import comboboxStyles from './combobox.css';
import {DismissButton} from '@react-aria/overlays';
import {Field} from '@react-spectrum/label';
import {FocusableRef, FocusableRefValue, ValidationState} from '@react-types/shared';
import {FocusRing, FocusScope} from '@react-aria/focus';
import {focusSafely} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {mergeProps, useId} from '@react-aria/utils';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {HTMLAttributes, ReactElement, ReactNode, RefObject, useCallback, useRef} from 'react';
import searchStyles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {setInteractionModality, useHover} from '@react-aria/interactions';
import {SpectrumComboBoxProps} from '@react-types/combobox';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {Tray} from '@react-spectrum/overlays';
import {useButton} from '@react-aria/button';
import {useComboBox} from '@react-aria/combobox';
import {useDialog} from '@react-aria/dialog';
import {useFilter} from '@react-aria/i18n';
import {useFocusableRef} from '@react-spectrum/utils';
import {useLabel} from '@react-aria/label';
import {useMessageFormatter} from '@react-aria/i18n';
import {useOverlayTrigger} from '@react-aria/overlays';
import {useProviderProps} from '@react-spectrum/provider';

export const MobileComboBox = React.forwardRef(function MobileComboBox<T extends object>(props: SpectrumComboBoxProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);

  let {
    isQuiet,
    isDisabled,
    validationState,
    loadingState
  } = props;

  let formatMessage = useMessageFormatter(intlMessages);
  let {contains} = useFilter({sensitivity: 'base'});
  let state = useComboBoxState({
    ...props,
    defaultFilter: contains,
    allowsEmptyCollection: true,
    shouldCloseOnBlur: false
  });

  let buttonRef = useRef<HTMLElement>();
  let domRef = useFocusableRef(ref, buttonRef);
  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'listbox'}, state, buttonRef);

  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  // Focus the button and show focus ring when clicking on the label
  labelProps.onClick = () => {
    if (!props.isDisabled) {
      buttonRef.current.focus();
      setInteractionModality('keyboard');
    }
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

  let loadingCircle = (
    <ProgressCircle
      aria-label={formatMessage('loading')}
      size="S"
      isIndeterminate
      UNSAFE_className={classNames(
        textfieldStyles,
        'spectrum-Textfield-circleLoader',
        classNames(
          styles,
          'spectrum-InputGroup-input-circleLoader'
        )
      )} />
  );

  return (
    <>
      <Field
        {...props}
        labelProps={labelProps}
        elementType="span"
        ref={domRef}
        includeNecessityIndicatorInAccessibilityName
        labelClassName={labelClassName}>
        <ComboBoxButton
          {...mergeProps(triggerProps, fieldProps)}
          ref={buttonRef}
          isQuiet={isQuiet}
          isDisabled={isDisabled}
          isPlaceholder={!state.inputValue}
          validationState={validationState}
          onPress={() => state.open()}
          inputClassName={inputClassName}
          isLoading={loadingState === 'loading' || loadingState === 'filtering'}
          loadingIndicator={loadingState != null && loadingCircle}>
          {state.inputValue || props.placeholder || ''}
        </ComboBoxButton>
      </Field>
      <Tray isOpen={state.isOpen} onClose={state.commit} isFixedHeight isNonModal {...overlayProps}>
        <ComboBoxTray
          {...props}
          overlayProps={overlayProps}
          state={state} />
      </Tray>
    </>
  );
});

interface ComboBoxButtonProps extends AriaButtonProps {
  isQuiet?: boolean,
  isDisabled?: boolean,
  isPlaceholder?: boolean,
  validationState?: ValidationState,
  children?: ReactNode,
  style?: React.CSSProperties,
  className?: string,
  inputClassName?: string,
  isLoading?: boolean,
  loadingIndicator?: ReactElement
}

const ComboBoxButton = React.forwardRef(function ComboBoxButton(props: ComboBoxButtonProps, ref: RefObject<HTMLElement>) {
  let {
    isQuiet,
    isDisabled,
    isPlaceholder,
    validationState,
    children,
    style,
    className,
    inputClassName,
    isLoading,
    loadingIndicator
  } = props;
  let formatMessage = useMessageFormatter(intlMessages);
  let valueId = useId();
  let invalidId = useId();
  let validationIcon = validationState === 'invalid'
    ? <AlertMedium id={invalidId} aria-label={formatMessage('invalid')} />
    : <CheckmarkMedium />;

  let validation = React.cloneElement(validationIcon, {
    UNSAFE_className: classNames(
      textfieldStyles,
      'spectrum-Textfield-validationIcon',
      classNames(
        styles,
        'spectrum-InputGroup-input-validationIcon'
      )
    )
  });

  let {hoverProps, isHovered} = useHover({});
  let {buttonProps, isPressed} = useButton({
    ...props,
    'aria-labelledby': [
      props['aria-labelledby'],
      props['aria-label'] && !props['aria-labelledby'] ? props.id : null,
      valueId,
      validationState === 'invalid' ? invalidId : null
    ].filter(Boolean).join(' '),
    elementType: 'div'
  }, ref);

  return (
    <FocusRing
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(hoverProps, buttonProps)}
        aria-haspopup="dialog"
        ref={ref as RefObject<HTMLDivElement>}
        style={{...style, outline: 'none'}}
        className={
          classNames(
            styles,
            'spectrum-InputGroup',
            {
              'spectrum-InputGroup--quiet': isQuiet,
              'is-disabled': isDisabled,
              'spectrum-InputGroup--invalid': validationState === 'invalid',
              'is-hovered': isHovered
            },
            classNames(
              comboboxStyles,
              'mobile-combobox'
            ),
            className
          )
        }>
        <div
          className={
            classNames(
              textfieldStyles,
              'spectrum-Textfield',
              {
                'spectrum-Textfield--invalid': validationState === 'invalid',
                'spectrum-Textfield--valid': validationState === 'valid',
                'spectrum-Textfield--loadable': loadingIndicator,
                'spectrum-Textfield--quiet': isQuiet
              },
              classNames(
                styles,
                'spectrum-InputGroup-field'
              )
            )
          }>
          <div
            className={
              classNames(
                textfieldStyles,
                'spectrum-Textfield-input',
                {
                  'is-hovered': isHovered,
                  'is-placeholder': isPlaceholder,
                  'is-disabled': isDisabled
                },
                classNames(
                  styles,
                  'spectrum-InputGroup-input',
                  classNames(labelStyles, 'spectrum-Field-field')
                ),
                classNames(
                  comboboxStyles,
                  'mobile-input'
                ),
                inputClassName
              )
            }>
            <span
              id={valueId}
              className={
                classNames(
                  comboboxStyles,
                  'mobile-value'
                )
              }>
              {children}
            </span>
          </div>
          {validationState && !isLoading ? validation : null}
          {isLoading && loadingIndicator}
        </div>
        <div
          className={
            classNames(
              buttonStyles,
              'spectrum-FieldButton',
              {
                'spectrum-FieldButton--quiet': isQuiet,
                'is-active': isPressed,
                'is-disabled': isDisabled,
                'spectrum-FieldButton--invalid': validationState === 'invalid',
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
  overlayProps: HTMLAttributes<HTMLElement>,
  loadingIndicator?: ReactElement
}

function ComboBoxTray(props: ComboBoxTrayProps) {
  let {
    // completionMode = 'suggest',
    menuTrigger = 'input',
    state,
    isDisabled,
    validationState,
    label,
    overlayProps,
    loadingState,
    onLoadMore
  } = props;

  let inputRef = useRef<HTMLInputElement>();
  let buttonRef = useRef<FocusableRefValue<HTMLElement>>();
  let popoverRef = useRef<HTMLDivElement>();
  let listBoxRef = useRef<HTMLDivElement>();
  let layout = useListBoxLayout(state);
  let formatMessage = useMessageFormatter(intlMessages);

  let {inputProps, listBoxProps, labelProps} = useComboBox(
    {
      ...props,
      // completionMode,
      keyboardDelegate: layout,
      buttonRef: unwrapDOMRef(buttonRef),
      popoverRef: popoverRef,
      listBoxRef,
      inputRef,
      menuTrigger
    },
    state
  );

  React.useEffect(() => {
    focusSafely(inputRef.current);
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
  inputProps['aria-haspopup'] = 'listbox';
  delete inputProps.onTouchEnd;

  let clearButton = (
    <ClearButton
      preventFocus
      aria-label={formatMessage('clear')}
      excludeFromTabOrder
      onPress={() => {
        state.setInputValue('');
        inputRef.current.focus();
      }}
      UNSAFE_className={
        classNames(
          searchStyles,
          'spectrum-ClearButton'
        )
      }
      isDisabled={isDisabled} />
  );

  let loadingCircle = (
    <ProgressCircle
      aria-label={formatMessage('loading')}
      size="S"
      isIndeterminate
      UNSAFE_className={classNames(
        searchStyles,
        'spectrum-Search-circleLoader',
        classNames(
          textfieldStyles,
          'spectrum-Textfield-circleLoader'
        )
      )} />
  );

  // Close the software keyboard on scroll to give the user a bigger area to scroll.
  // But only do this if scrolling with touch, otherwise it can cause issues with touch
  // screen readers.
  let isTouchDown = useRef(false);
  let onTouchStart = () => {
    isTouchDown.current = true;
  };

  let onTouchEnd = () => {
    isTouchDown.current = false;
  };

  let onScroll = useCallback(() => {
    if (!inputRef.current || document.activeElement !== inputRef.current || !isTouchDown.current) {
      return;
    }

    popoverRef.current.focus();
  }, [inputRef, popoverRef, isTouchDown]);

  return (
    <FocusScope restoreFocus contain>
      <div
        {...mergeProps(overlayProps, dialogProps)}
        ref={popoverRef}
        className={
          classNames(
            comboboxStyles,
            'tray-dialog'
          )
        }>
        <DismissButton onDismiss={() => state.commit()} />
        <TextFieldBase
          label={label}
          labelProps={labelProps}
          inputProps={inputProps}
          inputRef={inputRef}
          isDisabled={isDisabled}
          isLoading={loadingState === 'filtering'}
          loadingIndicator={loadingState != null && loadingCircle}
          validationState={validationState}
          wrapperChildren={(state.inputValue !== '' || loadingState === 'filtering') && !props.isReadOnly && clearButton}
          UNSAFE_className={
            classNames(
              searchStyles,
              'spectrum-Search',
              'spectrum-Textfield',
              'spectrum-Search--loadable',
              {
                'spectrum-Search--invalid': validationState === 'invalid',
                'spectrum-Search--valid': validationState === 'valid'
              },
              classNames(
                comboboxStyles,
                'tray-textfield',
                {
                  'has-label': !!props.label
                }
              )
            )
          }
          inputClassName={
            classNames(
              comboboxStyles,
              'tray-textfield-input',
              classNames(
                searchStyles,
                'spectrum-Search-input'
              )
            )
          }
          validationIconClassName={
            classNames(
              searchStyles,
              'spectrum-Search-validationIcon'
            )
          } />
        <ListBoxBase
          domProps={mergeProps(listBoxProps, {onTouchStart, onTouchEnd})}
          disallowEmptySelection
          shouldSelectOnPressUp
          focusOnPointerEnter
          layout={layout}
          state={state}
          shouldUseVirtualFocus
          renderEmptyState={() => loadingState !== 'loading' && (
            <span className={classNames(comboboxStyles, 'no-results')}>
              {formatMessage('noResults')}
            </span>
          )}
          UNSAFE_className={
            classNames(
              comboboxStyles,
              'tray-listbox'
            )
          }
          ref={listBoxRef}
          onScroll={onScroll}
          onLoadMore={onLoadMore}
          isLoading={loadingState === 'loading' || loadingState === 'loadingMore'} />
        <DismissButton onDismiss={() => state.commit()} />
      </div>
    </FocusScope>
  );
}
