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

import {classNames, unwrapDOMRef} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import {CommandPaletteState, useCommandPaletteState} from '@react-stately/commandpalette';
import commandpaletteStyles from './commandpalette.css';
import {DismissButton} from '@react-aria/overlays';
import {FocusableRefValue} from '@react-types/shared';
import {focusSafely} from '@react-aria/focus';
import {FocusScope} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {mergeProps} from '@react-aria/utils';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {HTMLAttributes, ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import searchStyles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {setInteractionModality} from '@react-aria/interactions';
import {SpectrumCommandPaletteProps} from '@react-types/commandpalette';
import {TextFieldBase} from '@react-spectrum/textfield';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {Tray} from '@react-spectrum/overlays';
import {useCommandPalette} from '@react-aria/commandpalette';
import {useDialog} from '@react-aria/dialog';
import {useField} from '@react-aria/label';
import {useFilter} from '@react-aria/i18n';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useOverlayTrigger} from '@react-aria/overlays';
import {useProviderProps} from '@react-spectrum/provider';

export const MobileCommandPalette = React.forwardRef(function MobileCommandPalette<T extends object>(props: SpectrumCommandPaletteProps<T>) {
  props = useProviderProps(props);

  let {contains} = useFilter({sensitivity: 'base'});
  let state = useCommandPaletteState({
    ...props,
    defaultFilter: contains
  });

  let buttonRef = useRef<HTMLElement>();
  let {overlayProps} = useOverlayTrigger({type: 'listbox'}, state, buttonRef);

  let {labelProps} = useField({
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

  return (
    <Tray isOpen={state.isOpen} isFixedHeight {...overlayProps}>
      <CommandPaletteTray
        {...props}
        onClose={state.close}
        overlayProps={overlayProps}
        state={state} />
    </Tray>
  );
});

interface CommandPaletteTrayProps extends SpectrumCommandPaletteProps<unknown> {
  state: CommandPaletteState<unknown>,
  overlayProps: HTMLAttributes<HTMLElement>,
  loadingIndicator?: ReactElement,
  onClose: () => void
}

function CommandPaletteTray(props: CommandPaletteTrayProps) {
  let {
    state,
    overlayProps,
    loadingState,
    onLoadMore,
    onClose
  } = props;

  let timeout = useRef(null);
  let [showLoading, setShowLoading] = useState(false);
  let inputRef = useRef<HTMLInputElement>();
  let buttonRef = useRef<FocusableRefValue<HTMLElement>>();
  let popoverRef = useRef<HTMLDivElement>();
  let listBoxRef = useRef<HTMLDivElement>();
  let layout = useListBoxLayout(state);
  let stringFormatter = useLocalizedStringFormatter(intlMessages);

  let {inputProps, listBoxProps} = useCommandPalette(
    {
      ...props,
      // completionMode,
      keyboardDelegate: layout,
      buttonRef: unwrapDOMRef(buttonRef),
      popoverRef: popoverRef,
      listBoxRef,
      inputRef
    },
    state
  );

  React.useEffect(() => {
    focusSafely(inputRef.current);

    // When the tray unmounts, set state.isFocused (i.e. the tray input's focus tracker) to false.
    // This is to prevent state.isFocused from being set to true when the tray closes via tapping on the underlay
    // (FocusScope attempts to restore focus to the tray input when tapping outside the tray due to "contain")
    // Have to do this manually since React doesn't call onBlur when a component is unmounted: https://github.com/facebook/react/issues/12363
    return () => {
      state.setFocused(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let {dialogProps} = useDialog({
    'aria-labelledby': 'id' // TODO: Fix
  }, popoverRef);

  // Override the role of the input to "searchbox" instead of "commandpalette".
  // Since the listbox is always visible, the commandpalette role doesn't really give us anything.
  // VoiceOver on iOS reads "double tap to collapse" when focused on the input rather than
  // "double tap to edit text", as with a textbox or searchbox. We'd like double tapping to
  // open the virtual keyboard rather than closing the tray.
  inputProps.role = 'searchbox';
  inputProps['aria-haspopup'] = 'listbox';
  delete inputProps.onTouchEnd;

  let clearButton = (
    <ClearButton
      preventFocus
      aria-label={stringFormatter.format('clear')}
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
      } />
  );

  let loadingCircle = (
    <ProgressCircle
      aria-label={stringFormatter.format('loading')}
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

  let inputValue = inputProps.value;
  let lastInputValue = useRef(inputValue);
  useEffect(() => {
    if (loadingState === 'filtering' && !showLoading) {
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
    } else if (loadingState !== 'filtering') {
      // If loading is no longer happening, clear any timers and hide the loading circle
      setShowLoading(false);
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    lastInputValue.current = inputValue;
  }, [loadingState, inputValue, showLoading]);

  let onKeyDown = (e) => {
    // Close virtual keyboard if user hits Enter w/o any focused options
    if (e.key === 'Enter' && state.selectionManager.focusedKey == null) {
      popoverRef.current.focus();
    } else {
      inputProps.onKeyDown(e);
    }
  };

  return (
    <FocusScope restoreFocus contain>
      <div
        {...mergeProps(overlayProps, dialogProps)}
        ref={popoverRef}
        className={
          classNames(
            commandpaletteStyles,
            'tray-dialog'
          )
        }>
        <DismissButton onDismiss={onClose} />
        <TextFieldBase
          inputProps={{...inputProps, onKeyDown}}
          inputRef={inputRef}
          isLoading={showLoading && loadingState === 'filtering'}
          loadingIndicator={loadingState != null && loadingCircle}
          labelAlign="start"
          labelPosition="top"
          wrapperChildren={(state.inputValue !== '' || loadingState === 'filtering') && clearButton}
          UNSAFE_className={
            classNames(
              searchStyles,
              'spectrum-Search',
              'spectrum-Textfield',
              'spectrum-Search--loadable',
              classNames(
                commandpaletteStyles,
                'tray-textfield'
              )
            )
          }
          inputClassName={
            classNames(
              commandpaletteStyles,
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
          {...listBoxProps}
          domProps={{onTouchStart, onTouchEnd}}
          disallowEmptySelection
          shouldSelectOnPressUp
          focusOnPointerEnter
          layout={layout}
          state={state}
          shouldUseVirtualFocus
          renderEmptyState={() => loadingState !== 'loading' && (
            <span className={classNames(commandpaletteStyles, 'no-results')}>
              {stringFormatter.format('noResults')}
            </span>
          )}
          UNSAFE_className={
            classNames(
              commandpaletteStyles,
              'tray-listbox'
            )
          }
          ref={listBoxRef}
          onScroll={onScroll}
          onLoadMore={onLoadMore}
          isLoading={loadingState === 'loading' || loadingState === 'loadingMore'} />
        <DismissButton onDismiss={onClose} />
      </div>
    </FocusScope>
  );
}
