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
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {
  classNames,
  dimensionValue,
  SlotProvider,
  useDOMRef,
  useIsMobileDevice,
  useSlotProps,
  useUnwrapDOMRef
} from '@react-spectrum/utils';
import {DOMRef, DOMRefValue, FocusableRefValue, LabelPosition} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {FieldButton} from '@react-spectrum/button';
import {HiddenSelect, useSelect} from '@react-aria/select';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {mergeProps, useId, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import {Popover, Tray} from '@react-spectrum/overlays';
import {PressResponder, useHover} from '@react-aria/interactions';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, useCallback, useRef, useState} from 'react';
import {SpectrumPickerProps} from '@react-types/select';
import styles from '@adobe/spectrum-css-temp/components/dropdown/vars.css';
import {Text} from '@react-spectrum/text';
import {useFormProps} from '@react-spectrum/form';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {useSelectState} from '@react-stately/select';

/**
 * Pickers allow users to choose a single option from a collapsible list of options when space is limited.
 */
// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
export const Picker = React.forwardRef(function Picker<T extends object>(props: SpectrumPickerProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useSlotProps(props, 'picker');
  props = useProviderProps(props);
  props = useFormProps(props);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/picker');
  let {
    autoComplete,
    isDisabled,
    direction = 'bottom',
    align = 'start',
    shouldFlip = true,
    placeholder = stringFormatter.format('placeholder'),
    isQuiet,
    label,
    labelPosition = 'top' as LabelPosition,
    menuWidth,
    name,
    autoFocus
  } = props;

  let state = useSelectState(props);
  let domRef = useDOMRef(ref);

  let popoverRef = useRef<DOMRefValue<HTMLDivElement>>(null);
  let triggerRef = useRef<FocusableRefValue<HTMLElement>>(null);
  let unwrappedTriggerRef = useUnwrapDOMRef(triggerRef);
  let listboxRef = useRef(null);

  let isLoadingInitial = props.isLoading && state.collection.size === 0;
  let isLoadingMore = props.isLoading && state.collection.size > 0;
  let progressCircleId = useId();

  // We create the listbox layout in Picker and pass it to ListBoxBase below
  // so that the layout information can be cached even while the listbox is not mounted.
  // We also use the layout as the keyboard delegate for type to select.
  let layout = useListBoxLayout();
  let {labelProps, triggerProps, valueProps, menuProps, descriptionProps, errorMessageProps, isInvalid, validationErrors, validationDetails} = useSelect({
    ...props,
    'aria-describedby': (isLoadingInitial ? progressCircleId : undefined)
  }, state, unwrappedTriggerRef);

  let isMobile = useIsMobileDevice();
  let {hoverProps, isHovered} = useHover({isDisabled});

  // On small screen devices, the listbox is rendered in a tray, otherwise a popover.
  let listbox = (
    <ListBoxBase
      {...menuProps}
      ref={listboxRef}
      disallowEmptySelection
      autoFocus={state.focusStrategy || true}
      shouldSelectOnPressUp
      focusOnPointerEnter
      layout={layout}
      state={state}
      width={isMobile ? '100%' : undefined}
      // Set max height: inherit so Tray scrolling works
      UNSAFE_style={{maxHeight: 'inherit'}}
      isLoading={props.isLoading}
      showLoadingSpinner={isLoadingMore}
      onLoadMore={props.onLoadMore} />
  );

  // Measure the width of the button to inform the width of the menu (below).
  let [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);
  let {scale} = useProvider();

  let onResize = useCallback(() => {
    if (!isMobile && unwrappedTriggerRef.current) {
      let width = unwrappedTriggerRef.current.offsetWidth;
      setButtonWidth(width);
    }
  }, [unwrappedTriggerRef, setButtonWidth, isMobile]);

  useResizeObserver({
    ref: unwrappedTriggerRef,
    onResize: onResize
  });

  useLayoutEffect(onResize, [scale, state.selectedKey, onResize]);

  let overlay;
  if (isMobile) {
    overlay = (
      <Tray state={state}>
        {listbox}
      </Tray>
    );
  } else {
    // If quiet, use the default width, otherwise match the width of the button. This can be overridden by the menuWidth prop.
    // Always have a minimum width of the button width. When quiet, there is an extra offset to add.
    // Not using style props for this because they don't support `calc`.
    let width = isQuiet ? undefined : buttonWidth;
    let style = {
      width: menuWidth ? dimensionValue(menuWidth) : width,
      minWidth: isQuiet ? `calc(${buttonWidth}px + calc(2 * var(--spectrum-dropdown-quiet-offset)))` : buttonWidth
    };

    overlay = (
      <Popover
        UNSAFE_style={style}
        UNSAFE_className={classNames(styles, 'spectrum-Dropdown-popover', {'spectrum-Dropdown-popover--quiet': isQuiet})}
        ref={popoverRef}
        placement={`${direction} ${align}`}
        shouldFlip={shouldFlip}
        hideArrow
        state={state}
        triggerRef={unwrappedTriggerRef}
        scrollRef={listboxRef}>
        {listbox}
      </Popover>
    );
  }

  let contents = state.selectedItem ? state.selectedItem.rendered : placeholder;
  if (typeof contents === 'string') {
    contents = <Text>{contents}</Text>;
  }

  let picker = (
    <div
      className={
        classNames(
          styles,
          'spectrum-Dropdown',
          {
            'is-invalid': isInvalid && !isDisabled,
            'is-disabled': isDisabled,
            'spectrum-Dropdown--quiet': isQuiet
          }
        )
      }>
      <HiddenSelect
        autoComplete={autoComplete}
        isDisabled={isDisabled}
        state={state}
        triggerRef={unwrappedTriggerRef}
        label={label}
        name={name} />
      <PressResponder {...mergeProps(hoverProps, triggerProps)}>
        <FieldButton
          ref={triggerRef}
          isActive={state.isOpen}
          isQuiet={isQuiet}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          autoFocus={autoFocus}
          UNSAFE_className={classNames(styles, 'spectrum-Dropdown-trigger', {'is-hovered': isHovered})}>
          <SlotProvider
            slots={{
              icon: {UNSAFE_className: classNames(styles, 'spectrum-Icon'), size: 'S'},
              avatar: {UNSAFE_className: classNames(styles, 'spectrum-Dropdown-avatar'), size: 'avatar-size-100'},
              text: {
                ...valueProps,
                UNSAFE_className: classNames(
                  styles,
                  'spectrum-Dropdown-label',
                  {'is-placeholder': !state.selectedItem}
                )
              },
              description: {
                isHidden: true
              }
            }}>
            {contents}
          </SlotProvider>
          {isLoadingInitial &&
            <ProgressCircle
              id={progressCircleId}
              isIndeterminate
              size="S"
              aria-label={stringFormatter.format('loading')}
              UNSAFE_className={classNames(styles, 'spectrum-Dropdown-progressCircle')} />
          }
          {isInvalid && !isLoadingInitial && !isDisabled &&
            <AlertMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-invalidIcon')} />
          }
          <ChevronDownMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-chevron')} />
        </FieldButton>
      </PressResponder>
      {state.collection.size === 0 ? null : overlay}
    </div>
  );

  let wrapperClassName = classNames(
    styles,
    'spectrum-Field',
    {
      'spectrum-Dropdown-fieldWrapper--quiet': isQuiet,
      'spectrum-Dropdown-fieldWrapper--positionSide': labelPosition === 'side'
    }
  );

  return (
    <Field
      {...props}
      ref={domRef}
      wrapperClassName={wrapperClassName}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      isInvalid={isInvalid}
      validationErrors={validationErrors}
      validationDetails={validationDetails}
      showErrorIcon={false}
      includeNecessityIndicatorInAccessibilityName
      elementType="span">
      {picker}
    </Field>
  );
}) as <T>(props: SpectrumPickerProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
