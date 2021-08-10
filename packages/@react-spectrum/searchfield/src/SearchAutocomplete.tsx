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
import {classNames, useFocusableRef, useResizeObserver, useUnwrapDOMRef} from '@react-spectrum/utils';
import {DismissButton, useOverlayPosition} from '@react-aria/overlays';
import {DOMRefValue} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {FocusRing} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import Magnifier from '@spectrum-icons/ui/Magnifier';
import {Placement} from '@react-types/overlays';
import {Popover} from '@react-spectrum/overlays';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {forwardRef, InputHTMLAttributes, RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SpectrumSearchAutocompleteProps} from '@react-types/searchfield';
import styles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {TextFieldRef} from '@react-types/textfield';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useComboBoxState} from '@react-stately/combobox';
import {useFilter, useMessageFormatter} from '@react-aria/i18n';
import {useHover} from '@react-aria/interactions';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {useSearchAutocomplete} from '@react-aria/searchfield';

function SearchAutocomplete<T extends object>(props: SpectrumSearchAutocompleteProps<T>, ref: RefObject<TextFieldRef>) {
  props = useProviderProps(props);

  let {
    shouldFlip = true,
    direction = 'bottom',
    isQuiet,
    loadingState,
    onLoadMore
  } = props;


  let formatMessage = useMessageFormatter(intlMessages);
  let isAsync = loadingState != null;
  let popoverRef = useRef<DOMRefValue<HTMLDivElement>>();
  let unwrappedPopoverRef = useUnwrapDOMRef(popoverRef);
  let listBoxRef = useRef();
  let inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>();
  let domRef = useFocusableRef(ref, inputRef);

  let {contains} = useFilter({sensitivity: 'base'});
  let state = useComboBoxState(
    {
      ...props,
      defaultFilter: contains,
      allowsEmptyCollection: isAsync
    }
  );
  let layout = useListBoxLayout(state);

  let {inputProps, listBoxProps, labelProps} = useSearchAutocomplete(
    {
      ...props,
      keyboardDelegate: layout,
      popoverRef: unwrappedPopoverRef,
      listBoxRef,
      inputRef: inputRef,
      menuTrigger: 'input'
    },
    state
  );

  let {overlayProps, placement, updatePosition} = useOverlayPosition({
    targetRef: inputRef,
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
    if (inputRef.current) {
      let inputWidth = inputRef.current.offsetWidth;
      setMenuWidth(inputWidth);
    }
  }, [inputRef, setMenuWidth]);

  useResizeObserver({
    ref: domRef,
    onResize: onResize
  });

  useLayoutEffect(onResize, [scale, onResize]);

  // Update position once the ListBox has rendered. This ensures that
  // it flips properly when it doesn't fit in the available space.
  // TODO: add ResizeObserver to useOverlayPosition so we don't need this.
  useLayoutEffect(() => {
    if (state.isOpen) {
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [state.isOpen, updatePosition]);

  let style = {
    ...overlayProps.style,
    width: isQuiet ? null : menuWidth,
    minWidth: isQuiet ? `calc(${menuWidth}px + calc(2 * var(--spectrum-dropdown-quiet-offset)))` : menuWidth
  };

  return (
    <>
      <Field labelProps={labelProps} ref={domRef}>
        <SearchAutocompleteInput
          {...props}
          isOpen={state.isOpen}
          loadingState={loadingState}
          inputProps={inputProps}
          inputRef={inputRef} />
      </Field>
      <Popover
        isOpen={state.isOpen}
        UNSAFE_style={style}
        UNSAFE_className={classNames(styles, 'spectrum-InputGroup-popover', {'spectrum-InputGroup-popover--quiet': isQuiet})}
        ref={popoverRef}
        placement={placement}
        hideArrow
        isNonModal
        isDismissable={false}>
        <ListBoxBase
          {...listBoxProps}
          ref={listBoxRef}
          disallowEmptySelection
          autoFocus={state.focusStrategy}
          shouldSelectOnPressUp
          focusOnPointerEnter
          layout={layout}
          state={state}
          shouldUseVirtualFocus
          isLoading={loadingState === 'loadingMore'}
          onLoadMore={onLoadMore}
          renderEmptyState={() => isAsync && (
            <span>
              {formatMessage('noResults')}
            </span>
          )} />
        <DismissButton onDismiss={() => state.close()} />
      </Popover>
    </>
  );
}

interface SearchAutocompleteInputProps extends SpectrumSearchAutocompleteProps<unknown> {
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  // triggerProps: AriaButtonProps,
  // triggerRef: RefObject<FocusableRefValue<HTMLElement>>,
  style?: React.CSSProperties,
  className?: string,
  isOpen?: boolean
}

const SearchAutocompleteInput = React.forwardRef(function SearchAutocompleteInput(props: Omit<SearchAutocompleteInputProps, 'children'>, ref: RefObject<HTMLElement>) {
  let {
    isQuiet,
    isDisabled,
    isReadOnly,
    validationState,
    inputRef,
    inputProps,
    autoFocus,
    style,
    className,
    loadingState,
    isOpen
  } = props;
  let {hoverProps, isHovered} = useHover({});
  let formatMessage = useMessageFormatter(intlMessages);
  let timeout = useRef(null);
  let [showLoading, setShowLoading] = useState(false);

  let loadingCircle = (
    <ProgressCircle
      aria-label={'loading'}
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

  let icon = (
    <Magnifier data-testid="searchicon" />
  );

  let isLoading = loadingState === 'loading' || loadingState === 'filtering';
  let inputValue = inputProps.value;
  let lastInputValue = useRef(inputValue);
  useEffect(() => {
    if (isLoading && !showLoading) {
      if (timeout.current === null) {
        timeout.current = setTimeout(() => {
          setShowLoading(true);
        }, 500);
      }

      // If user is typing, clear the timer and restart since it is a new request
      if (inputValue !== lastInputValue.current) {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          setShowLoading(true);
        }, 500);
      }
    } else if (!isLoading) {
      // If loading is no longer happening, clear any timers and hide the loading circle
      setShowLoading(false);
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    lastInputValue.current = inputValue;
  }, [isLoading, showLoading, inputValue]);

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
              'spectrum-InputGroup--invalid': validationState === 'invalid',
              'is-hovered': isHovered
            },
            className
          )
        }>
        {/* <SearchField
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-InputGroup-field'
            )
          }
          aria-label="searchfield"
          isDisabled={isDisabled}
          isQuiet={isQuiet}
          isReadOnly={isReadOnly}
          validationState={validationState} /> */}
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
              'spectrum-InputGroup-input'
            )
          }
          validationIconClassName={
            classNames(
              styles,
              'spectrum-InputGroup-input-validationIcon'
            )
          }
          isDisabled={isDisabled}
          icon={icon}
          isQuiet={isQuiet}
          validationState={validationState}
          // loading circle should only be displayed if menu is open, if menuTrigger is "manual", or first time load (to stop circle from showing up when user selects an option)
          // TODO: add special case for completionMode: complete as well
          isLoading={showLoading && (isOpen || loadingState === 'loading')}
          loadingIndicator={loadingState != null && loadingCircle} />
      </div>
    </FocusRing>
  );
});


/**
 * A SearchAutocomplete is a searchfield that supports a dynamic list of suggestions.
 */
let _SearchAutocomplete = forwardRef(SearchAutocomplete);
export {_SearchAutocomplete as SearchAutocomplete};
